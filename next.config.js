/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {},
    experimental: {
        serverActions: {
            // Server Actions default to a 1MB body, which rejected timetable
            // PDFs and event images with "Body exceeded 1 MB limit" (413).
            // Kept above MAX_UPLOAD_BYTES (10MB) in src/lib/utils/upload.ts:
            // multipart boundaries and part headers count towards this limit
            // too, so the raw body is always a little larger than the file.
            bodySizeLimit: '12mb',
        },
    },
}

module.exports = nextConfig
