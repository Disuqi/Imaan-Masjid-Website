"use client"
import { formatBytes } from "@/lib/utils/upload";

const IMAGE_TARGET_MB = 1;
const IMAGE_MAX_DIMENSION = 1920;

// Re-encoding these would drop the animation, so they are left alone.
const ANIMATED_TYPES = ["image/gif", "image/apng"];

// Wide enough that a dense timetable's digits stay legible once rasterised.
const PDF_TARGET_WIDTH = 2200;
const PDF_MAX_SCALE = 4;
const PDF_MAX_PAGES = 4;
const PDF_QUALITY = 0.92;

export type Compressed =
{
    file: File,
    /** "8.4MB → 240KB", for showing the admin what happened. */
    note?: string
};

/**
 * Shrinks an image in the browser before it is uploaded.
 *
 * Cover images are displayed at 2:1 in a card, so a full-resolution phone photo
 * is wasted bytes twice over: once on the admin's upload and again on every
 * visitor's page load.
 *
 * Never throws — if anything goes wrong (a HEIC the browser can't decode, for
 * instance) the original file is returned and the server has the final say.
 */
export async function compressImage(file: File) : Promise<Compressed>
{
    if(file == null || ANIMATED_TYPES.includes(file.type))
        return { file };

    try
    {
        const imageCompression = (await import("browser-image-compression")).default;
        const compressed = await imageCompression(file, {
            maxSizeMB: IMAGE_TARGET_MB,
            maxWidthOrHeight: IMAGE_MAX_DIMENSION,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.85
        });

        // Already well optimised, or re-encoding made it worse.
        if(compressed.size >= file.size)
            return { file };

        const renamed = new File([compressed], replaceExtension(file.name, "webp"), { type: "image/webp" });
        return { file: renamed, note: `${formatBytes(file.size)} → ${formatBytes(renamed.size)}` };
    }
    catch (error)
    {
        console.error("Could not compress the image, sending it as-is: " + errorText(error));
        return { file };
    }
}

/**
 * Renders a PDF's pages to downscaled WebP images. This is the standard path for
 * timetable PDFs: it keeps the upload small and has proven to read reliably.
 *
 * There is no dependable general-purpose PDF compressor for the browser; what
 * the tools that claim to do it actually do is rasterise via PDF.js and
 * re-encode. Since Gemini accepts images directly, we can stop at the images and
 * skip rebuilding a PDF altogether.
 *
 * Throws on failure, so the caller can fall back to sending the original PDF.
 */
export async function rasterizePdf(file: File) : Promise<{ pages: File[], note: string }>
{
    const pdfjs = await import("pdfjs-dist");
    // Served from public/ rather than resolved by the bundler, so this does not
    // depend on Turbopack/webpack asset handling. Kept in sync by
    // scripts/copy-pdf-worker.mjs on install.
    //
    // Resolved against the page origin on purpose: given a bare path, pdf.js can
    // fall back to resolving the worker relative to the module's own location,
    // which some browsers reject as a file:// link ("Security Error: Content at
    // http://... may not load or link to file:///").
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("/pdf.worker.min.mjs", window.location.origin).href;

    // The loading task owns teardown in pdf.js v6 (the document proxy has no
    // destroy), and it must be destroyed to shut the worker down.
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const document_ = await loadingTask.promise;

    try
    {
        const pageCount = Math.min(document_.numPages, PDF_MAX_PAGES);
        const pages : File[] = [];

        for(let pageNumber = 1; pageNumber <= pageCount; pageNumber++)
        {
            const page = await document_.getPage(pageNumber);
            const unscaled = page.getViewport({ scale: 1 });
            const scale = Math.min(PDF_TARGET_WIDTH / unscaled.width, PDF_MAX_SCALE);
            const viewport = page.getViewport({ scale: Math.max(scale, 1) });

            const canvas = window.document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);

            await page.render({ canvas, viewport }).promise;
            page.cleanup();

            const blob = await canvasToBlob(canvas);
            // Free the backing store straight away; these canvases are large.
            canvas.width = 0;
            canvas.height = 0;

            if(blob == null)
                throw new Error(`Could not encode page ${pageNumber}`);

            pages.push(new File([blob], `page-${pageNumber}.webp`, { type: "image/webp" }));
        }

        if(pages.length == 0)
            throw new Error("The PDF has no pages");

        const total = pages.reduce((sum, page) => sum + page.size, 0);
        return {
            pages: pages,
            note: `${formatBytes(file.size)} → ${formatBytes(total)}`
        };
    }
    finally
    {
        await loadingTask.destroy();
    }
}

function canvasToBlob(canvas: HTMLCanvasElement) : Promise<Blob>
{
    return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", PDF_QUALITY));
}

function replaceExtension(filename: string, extension: string) : string
{
    const withoutExtension = filename.replace(/\.[^.]+$/, "");
    return `${withoutExtension || "image"}.${extension}`;
}

function errorText(error: unknown) : string
{
    return error instanceof Error ? error.message : String(error);
}
