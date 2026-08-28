import LinkButton from "@/app/components/buttons/linkButton";
import {IoArrowForward} from "react-icons/io5";

export default function RemoveEventBtn()
{
    return <LinkButton size="lg" variant="outlined" href={"/events"}
                       endDecorator={<IoArrowForward/>}
                       className="!border-bg-300 !text-text-100 hover:!bg-bg-200 transition duration-150 ease-in-out">
        Manage Events
    </LinkButton>
}
