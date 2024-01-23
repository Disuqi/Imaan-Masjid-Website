
import {Button} from "@mui/joy";
import Link from "next/link";

export default function EditEventBtn()
{
    return <>
        <Link href="/events">
            <Button size="lg">
                Edit
            </Button>
        </Link>
    </>
}