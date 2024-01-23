import {Button} from "@mui/joy";
import Link from "next/link";

export default function RemoveEventBtn()
{
    return <>
        <Link href="/events">
            <Button size="lg">
                Remove
            </Button>
        </Link>
    </>
}