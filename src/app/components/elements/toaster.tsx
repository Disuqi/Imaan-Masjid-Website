"use client"
import {Toaster} from "react-hot-toast";

/**
 * One toaster for the whole app, rendered from the root layout, so any page or
 * dialog can call toast() without having to mount its own.
 */
export default function AppToaster()
{
    return <Toaster
        position="top-center"
        toastOptions={{
            // Follows the site's theme instead of defaulting to a white box.
            style: {
                background: "rgb(var(--bg-200))",
                color: "rgb(var(--text-100))",
                border: "1px solid rgb(var(--bg-300))",
                maxWidth: "min(92vw, 30rem)",
            },
            success: { iconTheme: { primary: "rgb(var(--accent-100))", secondary: "rgb(var(--bg-100))" } },
            // Errors carry the detail, so give them longer to be read.
            error: { duration: 6000 },
        }}/>
}
