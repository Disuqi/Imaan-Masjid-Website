"use client"
import React, {useState} from "react";
import AddEventForm from "@/app/components/forms/add_event";
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog} from "@mui/joy";
import supabase from "@/lib/supabase";
import toast from "react-hot-toast";
import {Event} from "@/app/entities/event";
import LoadingAnimation from "@/app/components/utils/loading";
import {Size} from "@/app/components/utils/size";

export default function AddEventBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (formEvent) =>
    {
        setLoading(true);
        formEvent.preventDefault();
        const formData = new FormData(formEvent.target);
        await addEvent(formData);
        setLoading(false);
        setModalState(false);
    };

    const closeModal = () =>
    {
        if (!loading)
            setModalState(false);
    }
    return <>
        <Button size="lg" onClick={() => setModalState(true)}>
            Add
        </Button>
        <Modal open={modalState} onClose={closeModal}>
            <ModalDialog>
                {loading ?
                    <div className="flex flex-row w-full items-center justify-center gap-6">
                        <h1 className="font-bold text-3xl">Uploading</h1>
                        <LoadingAnimation size={Size.M}/>
                    </div> :
                <><ModalClose/>
                <DialogTitle>Add Event</DialogTitle>
                <DialogContent>
                    <AddEventForm onSubmit={onSubmit}/>
                </DialogContent></>
                }
            </ModalDialog>
        </Modal>
    </>
}

async function addEvent(formData)
{
    const title : string = formData.get("title") as string;
    const description : string = formData.get("description") as string;
    const dateString : string = formData.get("date") as string;
    const timeString : string = formData.get("time") as string;
    const image : File = formData.get("image") as File;


    let dateTimeString: string = `${dateString}`;
    if(timeString != null && timeString != "")
    {
        dateTimeString += `T${timeString}`;
    }
    const date: Date = new Date(dateTimeString);

    const event : Event = new Event(title, description, date)
    const addEvent = await supabase.from("Event").insert(event);
    if(addEvent.error != null)
    {
        console.log(addEvent.error);
        toast.error("Failed to add event");
        return;
    }

    toast.success("Event added");

    if (image == null || image.size == 0)
        return;
    console.log(image.name)
    await uploadAndSetImage(event, image);
}

async function uploadAndSetImage(event : Event, image: File)
{
    console.log("Uploading image");
    const filename = event.title.toLowerCase().replace(/\s/g, '_')
    const uploadImage = await supabase.storage.from("event_images").upload(filename, image)
    if(uploadImage.error != null)
    {
        console.log("Failed to upload image")
        console.log(uploadImage.error);
        toast.error("Failed to save image");
        return;
    }

    const updateEvent = await supabase.from("Event").update({image: filename}).eq("title", event.title);
    if(updateEvent.error != null)
    {
        console.log("Failed to set filename")
        console.log(updateEvent.error);
        toast.error("Failed to set image for event");
        return;
    }

    toast.success("Image set for event");
}