import Link from "next/link";
import {Button} from "@mui/joy";
import {ReactNode} from "react";

export default function LinkButton(props: {href : string, className?: string, size?: "md" | "sm" | "lg", variant?: "solid" | "soft" | "outlined" | "plain", endDecorator?: ReactNode , children : ReactNode})
{
    return <Button variant={props.variant} size={props.size} component="div" endDecorator={props.endDecorator} className={props.className}>
        <Link href={props.href}>
            {props.children}
        </Link>
    </Button>
}