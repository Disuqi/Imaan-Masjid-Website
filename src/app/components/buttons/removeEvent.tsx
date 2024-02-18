import {Button} from "@mui/joy";
import Link from "next/link";
import LinkButton from "@/app/components/buttons/linkButton";

export default function RemoveEventBtn()
{
    return <>
        <LinkButton size="lg" href={"/events"}>Remove</LinkButton>
    </>
}