/**
 * Copies pdf.js's worker into public/ so it can be served from a stable URL
 * (/pdf.worker.min.mjs) instead of relying on bundler asset resolution.
 *
 * Runs on install so the worker can never drift from the installed pdfjs-dist
 * version. Warns rather than fails: a missing worker only disables PDF
 * rasterisation, and should not break `npm install`.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const WORKER = "pdf.worker.min.mjs";

try
{
    const require = createRequire(import.meta.url);
    const pdfjsRoot = dirname(require.resolve("pdfjs-dist/package.json"));
    const source = join(pdfjsRoot, "build", WORKER);
    const destination = join(process.cwd(), "public", WORKER);

    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
    console.log(`Copied ${WORKER} to public/`);
}
catch (error)
{
    console.warn(`Could not copy ${WORKER}: ${error.message}`);
    console.warn("PDF timetables will still upload, but large ones cannot be compressed in the browser.");
}
