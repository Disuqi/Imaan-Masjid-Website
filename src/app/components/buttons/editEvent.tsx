
import {Button} from "@mui/joy";
import Link from "next/link";

export default function EditEventBtn()
{
    return <>
        <Button component="a" size="lg">
            <Link href="/events">
                    Edit
            </Link>
        </Button>
    </>
}