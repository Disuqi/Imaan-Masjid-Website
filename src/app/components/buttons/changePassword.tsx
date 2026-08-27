"use client"
import {useState} from "react";
import {Button} from "@mui/joy";
import FormModal from "@/app/components/elements/formModal";
import ChangePasswordForm from "@/app/components/forms/changePassword";
import {IoKeyOutline} from "react-icons/io5";

export default function ChangePasswordBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);

    return <>
        <Button component="div" size="lg" variant="outlined" color="neutral" startDecorator={<IoKeyOutline/>}
                onClick={() => setModalState(true)}
                className="!border-bg-300 !text-text-100 hover:!bg-bg-200 transition duration-150 ease-in-out">
            Change Password
        </Button>
        <FormModal
            open={modalState}
            title="Change Password"
            description="You'll stay signed in on this device after changing it."
            loading={loading}
            loadingText="Updating password…"
            onClose={() => setModalState(false)}>
            <ChangePasswordForm
                onStart={() => setLoading(true)}
                onComplete={(success) =>
                {
                    setLoading(false);
                    if(success)
                        setModalState(false);
                }}/>
        </FormModal>
    </>
}
