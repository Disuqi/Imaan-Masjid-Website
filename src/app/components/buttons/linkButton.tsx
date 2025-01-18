import Link from "next/link";
import {Button} from "@mui/joy";
import {ReactNode} from "react";

export default function LinkButton(props: {href : string, className?: string, size?: "md" | "sm" | "lg", variant?: "solid" | "soft" | "outlined" | "plain", endDecorator?: ReactNode , children : ReactNode})
{
    let className = props.className;
    if (className == null)
    {
        className = "bg-primary-100 text-text-100 hover:bg-primary-200 hover:text-text-200 transition duration-150 ease-in-out";
    }
    return <Button variant={props.variant} size={props.size} component="div" endDecorator={props.endDecorator} className={className}>
        <Link href={props.href}>
            {props.children}
        </Link>
    </Button>
}