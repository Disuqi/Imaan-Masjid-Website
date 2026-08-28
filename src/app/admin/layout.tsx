import { ReactNode } from "react";

/**
 * Reading a timetable takes longer than a page render: the PDF is uploaded to
 * the conversion service and one or more models are given a chance to answer.
 *
 * Without this the function is cut off at Vercel's legacy 10s default, which
 * returns 504 FUNCTION_INVOCATION_TIMEOUT with no body — so the Server Action's
 * own error never reaches the browser and every failure looks the same.
 *
 * Must stay above TOTAL_BUDGET_MS in src/lib/timetable_pdf.ts.
 */
export const maxDuration = 60;

export default function AdminLayout({ children }: { children: ReactNode })
{
    return children;
}
