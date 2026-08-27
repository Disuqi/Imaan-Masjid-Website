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

/**
 * Explains why every model failed, in terms the admin can act on.
 *
 * Running out of quota and every model being overloaded need different advice —
 * one is worth retrying in a minute, the other is not — so they get different
 * messages rather than one catch-all.
 */
function describeAllFailed(failures: { model: string, detail: string, status: number }[]) : string
{
    const contact = `If it keeps happening, contact the developer at ${DEVELOPER_EMAIL}.`;

    if(failures.length == 0)
        return `The timetable could not be converted. ${contact}`;

    if(failures.every((failure) => failure.status == 429))
    {
        const seconds = shortestRetryDelay(failures);
        const when = seconds == null ? "Please try again later"
            : seconds <= 120 ? `Please try again in about ${Math.max(1, Math.ceil(seconds / 10) * 10)} seconds`
            : "The daily limit may have run out, so please try again later";

        return `The conversion service has used up its request quota on all ${failures.length} models. ${when}. ${contact}`;
    }

    return `The conversion service is unavailable right now — all ${failures.length} models failed to respond. Please try again later. ${contact}`;
}

/** Reads the "Please retry in 48.19s" hint the API returns with a 429. */
function shortestRetryDelay(failures: { detail: string }[]) : number
{
    const delays = failures
        .map((failure) => failure.detail.match(/retry in ([\d.]+)s/i))
        .filter((match) => match != null)
        .map((match) => parseFloat(match[1]))
        .filter((seconds) => !isNaN(seconds));

    return delays.length == 0 ? null : Math.min(...delays);
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
    let outputText: string = null;
    let attempted = 0;

    for(const model of models)
    {
        attempted++;
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
                timeout_ms: 120000
            });

            outputText = interaction.output_text;

            if(attempted > 1)
                console.warn(`Read the timetable with ${model} after ${attempted - 1} model(s) were unavailable.`);

            break;
        }
        catch (error)
        {
            const detail = describeCause(error);
            failures.push({ model: model, detail: detail, status: statusOf(error) });
            console.error(`Failed to read the timetable with ${model}. Error: ${detail}`);

            // A permanent problem fails the same way on every model, so stop and
            // report it rather than working through the list.
            if(!isTransient(error))
                return { error: `The timetable could not be read: ${detail}` };
        }
    }

    if(outputText == null)
    {
        console.error(`All ${models.length} models failed: ${failures.map((f) => `${f.model} (HTTP ${f.status})`).join(", ")}`);
        return { error: describeAllFailed(failures) };
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
