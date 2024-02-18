import Link from "next/link";
import {Button} from "@mui/joy";

export default function LinkButton(props: {href : string, size? : "md" | "sm" | "lg", children})
{
    let size : "md" | "sm" | "lg" = "md";
    if(props.size)
        size = props.size;

    return <Button size={size} component="div">
        <Link href={props.href}>
            {props.children}
        </Link>
    </Button>
}