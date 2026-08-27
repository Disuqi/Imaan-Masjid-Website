"use client"
import React, {useState} from "react";
import {Button, Tooltip} from "@mui/joy";
import EventForm from "@/app/components/forms/event";
import FormModal from "@/app/components/elements/formModal";
import {Event} from "@/lib/entities/event";
import {MdEdit} from "react-icons/md";

export default function EditEventBtn(props: {event: Event, onUpdated: (event: Event) => void})
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);

    return <>
        <Tooltip title="Edit">
            <Button variant="plain" color="neutral" size="sm" onClick={() => setModalState(true)}>
                <MdEdit/>
            </Button>
        </Tooltip>
        <FormModal
            open={modalState}
            title="Edit Event"
            description="Changes appear on the events page straight away."
            loading={loading}
            loadingText="Saving changes…"
            onClose={() => setModalState(false)}>
            <EventForm
                event={props.event}
                onStart={() => setLoading(true)}
                onComplete={(saved) =>
                {
                    setLoading(false);
                    if(saved != null)
                    {
                        props.onUpdated(saved);
                        setModalState(false);
                    }
                }}/>
        </FormModal>
    </>
}
