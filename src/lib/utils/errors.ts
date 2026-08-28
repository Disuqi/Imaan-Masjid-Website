import { MAX_UPLOAD_BYTES, formatBytes } from "@/lib/utils/upload";

/**
 * Turns whatever a failed Server Action threw into something worth showing.
 *
 * Recognised failures get a specific, actionable message; anything else falls
 * back to the error's own message so the real cause is visible rather than
 * being swallowed into a generic "something went wrong".
 */
export function describeError(error: unknown, fallback: string) : string
{
    const message = error instanceof Error ? error.message : String(error ?? "");
    const statusCode = typeof error == "object" && error != null ? (error as {statusCode?: number}).statusCode : undefined;

    // Server Action body cap — the request never reached our code.
    if(statusCode == 413 || /body exceeded|payload too large|request entity too large/i.test(message))
    {
        return `That file is too large to upload — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}. Please compress it and try again.`;
    }

    // The action request itself failed, so there is no server-side message.
    if(/networkerror|failed to fetch|fetch failed|load failed|network request failed/i.test(message))
    {
        return "Couldn't reach the server. Check your connection and try again.";
    }

    if(/aborted|timeout|timed out|etimedout/i.test(message))
    {
        return "The server took too long to respond. Please try again.";
    }

    if(message.trim() != "")
        return message;

    return fallback;
}
