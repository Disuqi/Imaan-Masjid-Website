"use client"
import Link from "next/link";
import {Button} from "@mui/joy";
import {MouseEvent, ReactNode} from "react";

export default function LinkButton(props: {href : string, className?: string, size?: "md" | "sm" | "lg", variant?: "solid" | "soft" | "outlined" | "plain", endDecorator?: ReactNode, onClick?: (e: MouseEvent<HTMLAnchorElement>) => void, children : ReactNode})
{
    let className = props.className;
    if (className == null)
    {
        className = "bg-primary-100 text-text-100 hover:bg-primary-200 hover:text-text-200 transition duration-150 ease-in-out font-default";
    }else
    {
        const result = className.match("font");
        if (result == null || result.length == 0)
        {
            className += " font-default";
        }
    }

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) =>
    {
        // Same-page hash links: scroll manually so re-clicks work even when the
        // hash is already in the URL (Next's Link treats those as a no-op).
        if (props.href.startsWith("#"))
        {
            const target = document.getElementById(props.href.slice(1));
            if (target)
            {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        }
        props.onClick?.(e);
    };

    return <Button variant={props.variant} size={props.size} component="div" endDecorator={props.endDecorator} className={className}>
        <Link href={props.href} onClick={handleClick}>
            {props.children}
        </Link>
    </Button>
}