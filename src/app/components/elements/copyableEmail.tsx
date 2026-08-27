"use client"
import {useState} from "react";
import toast from "react-hot-toast";
import {IoCheckmark, IoCopyOutline} from "react-icons/io5";

/**
 * Shows an address and copies it on click.
 *
 * Deliberately not a mailto link or a contact form: a mailto depends on a mail
 * client being configured, and a form needs a backend. The address is also plain
 * selectable text, so it still works if the clipboard is unavailable.
 */
export default function CopyableEmail(props: {email: string})
{
    const [copied, setCopied] = useState(false);

    const copy = async () =>
    {
        try
        {
            await navigator.clipboard.writeText(props.email);
            setCopied(true);
            toast.success("Email copied");
            setTimeout(() => setCopied(false), 2000);
        }
        catch
        {
            // Denied permission, or an insecure context.
            toast.error("Couldn't copy — please select the address and copy it manually");
        }
    };

    return <div className="flex flex-row flex-wrap items-center gap-2 w-full">
        <code className="flex-1 min-w-0 py-2 px-3 rounded-md bg-bg-100 border border-bg-300 text-sm text-text-100 break-all select-all">
            {props.email}
        </code>
        <button type="button" onClick={copy} aria-label={`Copy ${props.email}`}
                className="flex flex-row items-center gap-2 px-4 py-2 rounded-md bg-accent-100 hover:brightness-110 text-white text-sm font-semibold transition duration-150 ease-out shrink-0">
            {copied ? <IoCheckmark/> : <IoCopyOutline/>}
            {copied ? "Copied" : "Copy"}
        </button>
    </div>
}
