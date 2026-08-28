/**
 * Shared upload ceiling for both PDFs and event images.
 *
 * This is the ceiling for what may be *sent*. Files are compressed on the client
 * first (see compress.ts), so reaching it should be rare.
 *
 * Server Actions cap the request body at 1MB by default, which is what produced
 * "Body exceeded 1 MB limit" (HTTP 413). The cap is raised in next.config.js via
 * experimental.serverActions.bodySizeLimit, which must stay comfortably ABOVE
 * this number: the limit applies to the raw HTTP body, so multipart boundaries
 * and part headers count towards it as well as the file itself.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatBytes(bytes: number) : string
{
    if(bytes >= 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * Checks a file before it is sent anywhere. Returns a message to show the user,
 * or null when the file is fine — catching this client-side means an oversized
 * file gets an instant, specific explanation instead of a failed round trip.
 */
export function checkUploadSize(file: File) : string
{
    if(file == null)
        return "No file was selected";

    if(file.size == 0)
        return "That file is empty";

    if(file.size > MAX_UPLOAD_BYTES)
        return `That file is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}. Please compress it and try again.`;

    return null;
}
