"use client"
import {useState} from "react";
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog} from "@mui/joy";
import LoadingAnimation from "@/app/components/elements/loading";
import {Size} from "@/lib/utils/size";
import AddPrayerTimesForm from "@/app/components/forms/addPrayerTimes";

export default function AddEventBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);

    const closeModal = () =>
    {
        if (!loading)
            setModalState(false);
    };

    return <>
        <Button component="div" size="lg" onClick={() => setModalState(true)}>
            Add
        </Button>
        <Modal open={modalState} onClose={closeModal}>
            <ModalDialog>
                <LoadingAnimation state={loading} text="Uploading" size={Size.M}/>
                <ModalClose/>
                <DialogTitle>Add Prayer Times</DialogTitle>
                <DialogContent>
                    <AddPrayerTimesForm onStart={() => setLoading(true)} onComplete={() => { setModalState(false); setLoading(false); }}/>
                </DialogContent>
            </ModalDialog>
        </Modal>
    </>
}