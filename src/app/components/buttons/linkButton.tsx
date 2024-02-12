import Link from "next/link";
import {Button} from "@mui/joy";

export default function LinkButton(props: {href, children})
{
    return <Button component="div">
        <Link href={props.href}>
            {props.children}
        </Link>
    </Button>
}