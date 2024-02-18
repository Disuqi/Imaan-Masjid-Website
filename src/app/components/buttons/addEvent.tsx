"use client"
import React, {useState} from "react";
import AddEventForm from "@/app/components/forms/addEvent";
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog} from "@mui/joy";
import LoadingAnimation from "@/app/components/utils/loading";
import {Size} from "@/app/components/utils/size";

export default function AddEventBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);

    const closeModal = () =>
    {
        if (!loading)
            setModalState(false);
    }

    return <>
        <Button component="div" size="lg" onClick={() => setModalState(true)}>
            Add
        </Button>
        <Modal open={modalState} onClose={closeModal}>
            <ModalDialog>
                <LoadingAnimation state={loading} text="Uploading Image" size={Size.M}/>
                <ModalClose/>
                <DialogTitle>Add Event</DialogTitle>
                <DialogContent>
                    <AddEventForm onStart={() => setLoading(true)} onComplete={() => { setModalState(false); setLoading(false); }}/>
                </DialogContent>
            </ModalDialog>
        </Modal>
    </>
}
