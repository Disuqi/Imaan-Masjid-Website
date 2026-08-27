"use client"
import {useState} from "react";
import {Button} from "@mui/joy";
import AddPrayerTimesForm from "@/app/components/forms/addPrayerTimes";
import FormModal from "@/app/components/elements/formModal";
import {IoCloudUploadOutline} from "react-icons/io5";

export default function AddPrayerTimesBtn()
{
    const [modalState, setModalState] = useState(false);
    // Null means "not loading"; a string is what to show over the dialog.
    const [loadingText, setLoadingText] = useState<string>(null);

    return <>
        <Button component="div" size="lg" startDecorator={<IoCloudUploadOutline/>} onClick={() => setModalState(true)}
                className="!bg-accent-100 hover:!bg-accent-200 !text-white transition duration-150 ease-in-out">
            Upload Month
        </Button>
        <FormModal
            open={modalState}
            wide
            title="Add Prayer Times"
            description="Upload one month at a time. A PDF is read for you; a CSV is used as-is and needs a month/year header row."
            loading={loadingText != null}
            loadingText={loadingText}
            onClose={() => setModalState(false)}>
            <AddPrayerTimesForm
                onLoading={setLoadingText}
                onComplete={(success) =>
                {
                    if(success)
                        setModalState(false);
                }}/>
        </FormModal>
    </>
}
