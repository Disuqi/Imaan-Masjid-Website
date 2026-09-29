import { ReactNode } from "react";

/**
 * Reading a timetable takes far longer than a page render: a real one-page
 * timetable takes 16-40s for a single model to transcribe, and an overloaded
 * model can spend ~45s before refusing. Without enough headroom the function
 * is killed and answers 504 FUNCTION_INVOCATION_TIMEOUT with no body, so the
 * Server Action's own error never reaches the browser.
 *
 * 300s is the Hobby maximum, and needs Fluid Compute ("fluid": true in
 * vercel.json): without it Hobby caps every function at 60s. Must stay above TOTAL_BUDGET_MS in
 * src/lib/timetable_pdf.ts.
 */
export const maxDuration = 300;

export default function AdminLayout({ children }: { children: ReactNode })
{
    return children;
}
