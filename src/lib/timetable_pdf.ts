"use server"
import { GoogleGenAI } from "@google/genai";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { TimetableRow } from "@/lib/utils/timetable";
import { DEVELOPER_EMAIL } from "@/app/constants";
import { checkUploadSize } from "@/lib/utils/upload";

// Flash models are the ones covered by the free tier, in descending order of
// capability. Tried in turn when one is overloaded: a 500 "experiencing high
// demand" is specific to a single model, so the next one usually works.
const FALLBACK_MODELS = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

/**
 * Statuses worth trying another model for. Deliberately excludes 400 (the
 * request itself is wrong) and 401/403 (the key is wrong) — those fail
 * identically on every model, so retrying only burns quota and time. 404 is
 * included because it means this key cannot reach that particular model.
 */
const TRANSIENT_STATUSES = new Set([404, 408, 409, 425, 429, 500, 502, 503, 504]);

/**
 * Total time all model attempts may take.
 *
 * Each attempt re-uploads the whole payload, so three slow ones could run for
 * minutes — long enough for a gateway to abandon the request and answer 504.
 * The browser then gets no payload at all, so nothing this action returns is
 * ever seen. Finishing inside a budget is what makes its errors reachable.
 */
const TOTAL_BUDGET_MS = 50000;

/** No single attempt may eat the whole budget. */
const ATTEMPT_TIMEOUT_MS = 30000;

/** Below this there is not enough time left for an attempt to be worth starting. */
const MIN_ATTEMPT_MS = 8000;

/**
 * The models to try, in order. GEMINI_MODEL, when set, is preferred but still
 * falls back to the rest.
 */
function modelChain() : string[]
{
    const preferred = process.env.GEMINI_MODEL?.trim();
    const chain = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS;
    return Array.from(new Set(chain));
}

function statusOf(error: unknown) : number
{
    const status = typeof error == "object" && error != null ? (error as {status?: number}).status : undefined;
    return typeof status == "number" ? status : null;
}

function isTransient(error: unknown) : boolean
{
    const status = statusOf(error);

    // No status at all means the request never got a reply (connection reset,
    // timeout), which is worth another attempt.
    if(status == null)
        return true;

    return TRANSIENT_STATUSES.has(status);
}

type QuotaFailure =
{
    /** True when the exhausted quota is a per-day one. */
    perDay: boolean,
    /** The quota's own id, e.g. GenerateRequestsPerDayPerProjectPerModel-FreeTier. */
    quotaId: string,
    /** The allowance that was used up, when the API reports it. */
    quotaValue: string,
    /** google.rpc.RetryInfo, in seconds. */
    retrySeconds: number
};

/**
 * Reads the structured quota details Google attaches to a 429.
 *
 * The prose message is not enough to act on: it carries a RetryInfo delay even
 * for a per-day quota, where waiting that long changes nothing. The quota id in
 * the QuotaFailure detail is what distinguishes "wait a minute" from "wait until
 * the daily allowance resets".
 */
async function readQuotaFailure(error: unknown) : Promise<QuotaFailure>
{
    const body = typeof error == "object" && error != null ? (error as {body?: unknown}).body : null;
    if(body == null)
        return null;

    let parsed: unknown;
    try
    {
        parsed = typeof body == "string" ? JSON.parse(body) : body;
    }
    catch
    {
        return null;
    }

    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const details = (first as {error?: {details?: unknown[]}})?.error?.details;
    if(!Array.isArray(details))
        return null;

    const quota = details.find((d) => typeof (d as {"@type"?: string})?.["@type"] == "string"
        && (d as {"@type": string})["@type"].endsWith("QuotaFailure")) as
        {violations?: {quotaId?: string, quotaValue?: string}[]};
    const retry = details.find((d) => typeof (d as {"@type"?: string})?.["@type"] == "string"
        && (d as {"@type": string})["@type"].endsWith("RetryInfo")) as {retryDelay?: string};

    const violation = quota?.violations?.[0];
    const quotaId = violation?.quotaId ?? null;
    const retrySeconds = retry?.retryDelay != null ? parseFloat(String(retry.retryDelay).replace(/s$/, "")) : null;

    if(quotaId == null && retrySeconds == null)
        return null;

    return {
        // Per-model daily allowances are the ones that cannot be waited out.
        perDay: quotaId != null && /perday/i.test(quotaId),
        quotaId: quotaId,
        quotaValue: violation?.quotaValue ?? null,
        retrySeconds: isNaN(retrySeconds) ? null : retrySeconds
    };
}

/**
 * Explains why every model failed, in terms the admin can act on.
 *
 * A daily allowance and a per-minute burst both arrive as 429s but need
 * opposite advice, so they are told apart rather than sharing one message.
 */
function describeAllFailed(
    failures: { model: string, detail: string, status: number }[],
    quota: QuotaFailure,
    ranOutOfTime: boolean) : string
{
    const contact = `Contact the developer at ${DEVELOPER_EMAIL}`;

    if(failures.length == 0)
        return `The timetable could not be converted. ${contact}.`;

    if(ranOutOfTime && !failures.every((failure) => failure.status == 429))
    {
        return `The conversion service took too long to answer. Please try again, `
            + `or upload the timetable as a CSV instead. ${contact} if it keeps happening.`;
    }

    if(failures.every((failure) => failure.status == 429))
    {
        const allowance = quota?.quotaValue != null ? ` (${quota.quotaValue} requests per model)` : "";

        if(quota?.perDay)
        {
            // Deliberately no "try again in N seconds" here: RetryInfo suggests
            // one even for a daily quota, and following it just fails again.
            return `The daily quota for the conversion service has run out on all ${failures.length} models${allowance}. `
                + `It resets at midnight US Pacific time. Upload the timetable as a CSV instead, or try again tomorrow. ${contact} to raise the limit.`;
        }

        const seconds = quota?.retrySeconds;
        const when = seconds == null || seconds > 300 ? "Please try again shortly"
            : `Please try again in about ${Math.max(10, Math.ceil(seconds / 10) * 10)} seconds`;

        return `The conversion service is rate limited on all ${failures.length} models${allowance}. ${when}, `
            + `or upload the timetable as a CSV instead. ${contact} if it keeps happening.`;
    }

    return `The conversion service is unavailable right now — all ${failures.length} models failed to respond. `
        + `Please try again later, or upload the timetable as a CSV instead. ${contact} if it keeps happening.`;
}

/**
 * Extracts something actionable from a failed SDK call.
 *
 * The SDK's own `message` is unhelpful ("400 API error occurred: {httpMeta…}"),
 * but it hangs the raw response body on `.body`, and that holds the real reason
 * — "API key not valid", a quota message, a rejected schema. `rawResponse`
 * cannot be re-read (the SDK has already consumed it), so `.body` is the only
 * place to look.
 */
function describeCause(error: unknown) : string
{
    const apiMessage = readApiMessage(error);
    const status = typeof error == "object" && error != null ? (error as {status?: number}).status : undefined;

    if(apiMessage != null)
        return status != null ? `${apiMessage} (HTTP ${status})` : apiMessage;

    return describeErrorChain(error);
}

/** Pulls `error.error.message` out of the API's JSON error body. */
function readApiMessage(error: unknown) : string
{
    if(typeof error != "object" || error == null)
        return null;

    const body = (error as {body?: unknown}).body;
    if(body == null)
        return null;

    let parsed: unknown = body;
    if(typeof body == "string")
    {
        try
        {
            parsed = JSON.parse(body);
        }
        catch
        {
            // Not JSON — a truncated or HTML error page is still better than nothing.
            return body.trim().slice(0, 300) || null;
        }
    }

    // The API returns either an object or a single-element array.
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const message = (first as {error?: {message?: string, status?: string}})?.error?.message;
    if(typeof message != "string" || message.trim() == "")
        return null;

    const apiStatus = (first as {error?: {status?: string}})?.error?.status;
    return apiStatus != null ? `${message} [${apiStatus}]` : message;
}

function describeErrorChain(error: unknown) : string
{
    const seen = new Set<unknown>();
    const messages: string[] = [];
    let current: unknown = error;

    while(current != null && !seen.has(current) && messages.length < 4)
    {
        seen.add(current);

        if(current instanceof Error)
        {
            const status = (current as {status?: number}).status;
            messages.push(status != null ? `${current.message} (HTTP ${status})` : current.message);
            current = current.cause;
        }
        else
        {
            messages.push(String(current));
            break;
        }
    }

    const detail = messages.filter((m) => m != null && m.trim() != "").join(" — caused by: ");
    return detail == "" ? "unknown error" : detail;
}

async function toBase64(file: File) : Promise<string>
{
    return Buffer.from(await file.arrayBuffer()).toString("base64");
}

export type TimetableConversion =
{
    error?: string,
    year?: number,
    /** Zero-based, matching Date. */
    month?: number,
    rows?: TimetableRow[]
}

const TIME = { type: "string", description: "The time exactly as printed on the timetable, as HH:MM with a leading zero. Do not convert between 12- and 24-hour. Empty string if the cell is blank." };

const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        month: { type: "integer", description: "Calendar month the timetable covers, 1 for January through 12 for December." },
        year: { type: "integer", description: "Four-digit year the timetable covers." },
        days: {
            type: "array",
            description: "One entry per day listed in the timetable, in date order.",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer", description: "Gregorian day of the month as a bare number, 1-31. Never include a month name." },
                    hijri: { type: "integer", description: "Hijri (Islamic) day of the month, 1-30. Use 0 only if the timetable genuinely has no Hijri column." },
                    fajr_adhan: TIME,
                    fajr_iqama: TIME,
                    sunrise: TIME,
                    dhuhr_adhan: TIME,
                    dhuhr_iqama: TIME,
                    asr_adhan: TIME,
                    asr_iqama: TIME,
                    mughrib_adhan: TIME,
                    isha_adhan: TIME,
                    isha_iqama: TIME
                },
                required: ["day", "fajr_adhan", "fajr_iqama", "sunrise", "dhuhr_adhan",
                           "dhuhr_iqama", "asr_adhan", "asr_iqama", "mughrib_adhan",
                           "isha_adhan", "isha_iqama"]
            }
        }
    },
    required: ["month", "year", "days"]
};

const SYSTEM_INSTRUCTION = `You transcribe mosque prayer timetables into structured data.

Reading the table's columns:
- Only the main timetable grid matters. Ignore everything outside it: titles,
  logos, mosque name and address, footers, page numbers, announcements and any
  notes printed around the table.
- The first column is the Gregorian day of the month. Its cells sometimes carry
  a month suffix, for example "01-Sep" instead of "01" — report only the day
  number, 1 for "01-Sep". That suffix is still a reliable indicator of which
  month the timetable covers.
- A column of weekday names ("Mon", "Tue", "Wed", ...) is labelling only. Never
  transcribe it, and never let it shift the other columns: it is not the Hijri
  date and not a prayer time.
- The Hijri (Islamic) date is its own column of numbers, typically just after
  the weekday names. That number is the "hijri" field.
- Every remaining column is a prayer time.

Rules:
- Read every day row in the table. Do not skip, summarise or invent rows.
- Transcribe times exactly as printed. Never estimate, interpolate or "correct" a time.
- Copy the clock as printed — do NOT convert between 12- and 24-hour, and do not
  add am/pm. Mosque timetables print afternoon prayers on a 12-hour clock, so a
  Dhuhr of "1:15" must come back as "01:15", NOT "13:15". Only pad to two digits.
- "Adhan"/"Begins"/"Start" is the adhan column. "Iqama"/"Jama'ah"/"Congregation" is the iqama column.
- Maghrib usually has only one time; use it as the adhan.
- If a cell is genuinely blank, return an empty string rather than guessing.
- The month and year come from the timetable's own heading.`;

/**
 * Converts an uploaded prayer timetable PDF into structured rows using Gemini.
 *
 * The result is deliberately NOT written to the database here: the caller shows
 * it for review first, because a single misread iqama time would otherwise be
 * published to the whole congregation silently.
 */
export async function convertTimetablePdf(formData: FormData) : Promise<TimetableConversion>
{
    // A Server Action that throws reaches the browser as Next's generic
    // "unexpected response from the server", which tells the admin nothing. This
    // action therefore always resolves with a message it chose itself.
    try
    {
        return await convertTimetable(formData);
    }
    catch (error)
    {
        const detail = describeCause(error);
        console.error("Unhandled failure while converting the timetable: " + detail);
        return { error: `The timetable could not be converted: ${detail}` };
    }
}

async function convertTimetable(formData: FormData) : Promise<TimetableConversion>
{
    // Gated like any other admin action — this spends API quota.
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return { error: "You need to be signed in to convert a timetable" };

    const apiKey = process.env.GEMINI_API_KEY;
    if(apiKey == null || apiKey == "")
        return { error: "No Gemini API key configured. Add GEMINI_API_KEY to .env.local." };

    // Either the original PDF, or the page images the browser rasterised from it
    // when the PDF was too large to send whole.
    const pdf = formData.get("timetable") as File;
    const pageImages = formData.getAll("pages").filter((page): page is File => page instanceof File);

    const content = [];
    if(pageImages.length > 0)
    {
        for(const page of pageImages)
        {
            const sizeError = checkUploadSize(page);
            if(sizeError != null)
                return { error: sizeError };

            content.push({
                type: "image" as const,
                data: await toBase64(page),
                mime_type: page.type || "image/webp",
                // A timetable is a dense grid of small digits, so detail matters
                // more here than token cost.
                resolution: "ultra_high" as const
            });
        }
    }
    else
    {
        const sizeError = checkUploadSize(pdf);
        if(sizeError != null)
            return { error: sizeError };

        content.push({
            type: "document" as const,
            data: await toBase64(pdf),
            mime_type: "application/pdf" as const
        });
    }

    const ai = new GoogleGenAI({ apiKey });
    const models = modelChain();
    const failures: { model: string, detail: string, status: number }[] = [];
    let quota: QuotaFailure = null;
    const startedAt = Date.now();
    let ranOutOfTime = false;
    let outputText: string = null;
    let attempted = 0;

    for(const model of models)
    {
        const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt);
        if(remaining < MIN_ATTEMPT_MS)
        {
            ranOutOfTime = true;
            console.warn(`Stopping after ${attempted} of ${models.length} models: out of time with ${Math.round(remaining / 1000)}s left.`);
            break;
        }

        attempted++;
        const timeout = Math.min(ATTEMPT_TIMEOUT_MS, remaining);
        console.log(`Reading the timetable with ${model} (attempt ${attempted} of ${models.length}, ${Math.round(timeout / 1000)}s allowed)…`);
        try
        {
            const interaction = await ai.interactions.create({
                model: model,
                system_instruction: SYSTEM_INSTRUCTION,
                input: [
                    { type: "text", text: "Transcribe every day of this prayer timetable." },
                    ...content
                ],
                response_format: {
                    type: "text",
                    mime_type: "application/json",
                    schema: RESPONSE_SCHEMA
                }
            }, {
                // Retries are disabled deliberately. The SDK retries by re-sending
                // the same Request, whose body has already been consumed, so the
                // retry fails with "TypeError: unusable" and hides whatever the
                // first attempt actually returned (a quota or validation error).
                retries: { strategy: "none" },
                timeout_ms: timeout
            });

            outputText = interaction.output_text;

            if(attempted > 1)
                console.warn(`Read the timetable with ${model} after ${attempted - 1} model(s) were unavailable.`);

            break;
        }
        catch (error)
        {
            const detail = describeCause(error);
            const status = statusOf(error);
            failures.push({ model: model, detail: detail, status: status });

            if(status == 429 && quota == null)
                quota = await readQuotaFailure(error);

            console.error(`Failed to read the timetable with ${model}. Error: ${detail}`);

            // A permanent problem fails the same way on every model, so stop and
            // report it rather than working through the list.
            if(!isTransient(error))
                return { error: `The timetable could not be read: ${detail}` };
        }
    }

    if(outputText == null)
    {
        console.error(`${attempted} of ${models.length} models failed in ${Math.round((Date.now() - startedAt) / 1000)}s: `
            + failures.map((f) => `${f.model} (HTTP ${f.status})`).join(", ")
            + (quota != null ? ` | quota ${quota.quotaId} (${quota.quotaValue ?? "?"}), perDay=${quota.perDay}` : "")
            + (ranOutOfTime ? " | stopped early, out of time" : ""));
        return { error: describeAllFailed(failures, quota, ranOutOfTime) };
    }

    if(outputText == null || outputText.trim() == "")
        return { error: "The model returned nothing — try again, or check the PDF is readable" };

    let parsed: { month?: number, year?: number, days?: TimetableRow[] };
    try
    {
        parsed = JSON.parse(outputText);
    }
    catch
    {
        console.error("Timetable conversion returned invalid JSON: " + outputText.slice(0, 500));
        return { error: "The model's response could not be read — please try again" };
    }

    const month = Number(parsed.month);
    const year = Number(parsed.year);
    if(!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100)
        return { error: "Could not work out which month and year the timetable covers" };

    if(!Array.isArray(parsed.days) || parsed.days.length == 0)
        return { error: "No day rows were found in the PDF" };

    return {
        year: year,
        // Zero-based from here on, to match Date and the CSV path.
        month: month - 1,
        rows: parsed.days
    };
}
