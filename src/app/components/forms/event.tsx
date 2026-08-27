"use client"
import {BsFillImageFill} from "react-icons/bs";
import {IoClose} from "react-icons/io5";
import {Button} from "@mui/joy";
import React, {useEffect, useState} from "react";
import {Event} from "@/lib/entities/event";
import toast from "react-hot-toast";
import { addEvent, deleteImage, updateEvent, uploadImage } from "@/lib/events";
import {describeError} from "@/lib/utils/errors";
import {checkUploadSize} from "@/lib/utils/upload";
import {compressImage} from "@/lib/utils/compress";

/**
 * Used for both creating and editing: passing an existing event switches the
 * form into edit mode.
 */
export default function EventForm(props: {event?: Event, onStart: () => void, onComplete: (saved: Event) => void})
{
    const editing = props.event != null;

    const [image, setImage] = useState<File>(null);
    const [preview, setPreview] = useState<string>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string>(props.event?.imageUrl ?? null);
    const [title, setTitle] = useState(props.event?.title ?? "");
    const [description, setDescription] = useState(props.event?.description ?? "");
    const [date, setDate] = useState(toDateInput(props.event?.date));
    const [time, setTime] = useState(toTimeInput(props.event?.date));
    const [submitting, setSubmitting] = useState(false);
    const [compressing, setCompressing] = useState(false);

    // Object URLs are leaked otherwise — one per file previewed.
    useEffect(() =>
    {
        if(preview == null)
            return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    const shownImage = preview ?? existingImageUrl;

    const imageUpload = async (e) =>
    {
        const chosen = e.target.files?.[0];
        if(chosen == null)
            return;

        // Compress before checking the size: a full-resolution phone photo is
        // over the limit but perfectly usable once resized, so rejecting it
        // outright would be unhelpful.
        setCompressing(true);
        const toastId = toast.loading("Preparing image…");
        const {file, note} = await compressImage(chosen);
        setCompressing(false);

        const sizeError = checkUploadSize(file);
        if(sizeError != null)
        {
            toast.error(sizeError, {id: toastId});
            e.target.value = "";
            return;
        }

        if(note != null)
            toast.success(`Image compressed (${note})`, {id: toastId});
        else
            toast.dismiss(toastId);

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const clearImage = () =>
    {
        setImage(null);
        setPreview(null);
        setExistingImageUrl(null);
    };

    const onSubmit = async () =>
    {
        if(submitting)
            return;
        if(compressing)
        {
            toast.error("Still preparing the image — try again in a moment");
            return;
        }

        const trimmedTitle = title.trim();
        if(trimmedTitle == "")
        {
            toast.error("An event needs a title");
            return;
        }
        if(date == "" && time != "")
        {
            toast.error("Pick a date to go with the time");
            return;
        }

        setSubmitting(true);
        props.onStart();

        const details : Event = {
            ...(props.event ?? {}),
            title: trimmedTitle,
            description: description.trim() == "" ? null : description.trim(),
            date: parseDateTime(date, time)
        };

        let saved: Event = null;
        try
        {
            saved = editing ?
                await saveExistingEvent(details, image, existingImageUrl == null)
                :
                await saveNewEvent(details, image);
        }
        finally
        {
            setSubmitting(false);
        }

        props.onComplete(saved);
    };

    return <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-text-200">Image <span className="opacity-60 font-normal">(optional)</span></label>
            <div className="relative">
                <label className="flex justify-center items-center w-full aspect-[2/1] overflow-hidden border-2 border-dashed border-bg-300 rounded-lg text-text-200 hover:border-accent-100 hover:bg-bg-200 transition duration-150 ease-out cursor-pointer"
                       htmlFor="eventImageFileInput">
                    {shownImage ?
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shownImage} className="w-full h-full object-cover" alt="Selected event image"/>
                        :
                        <div className="flex flex-col items-center gap-2 py-6">
                            <BsFillImageFill className="text-3xl text-accent-100"/>
                            <span className="text-sm font-semibold">Click to choose a cover image</span>
                            <span className="text-xs opacity-70">Shown at 2:1 · resized automatically</span>
                        </div>
                    }
                </label>
                {shownImage &&
                    <button type="button" onClick={clearImage} aria-label="Remove image"
                            className="absolute top-2 right-2 p-1 rounded-full bg-bg-100/90 text-text-100 hover:bg-bg-200 transition duration-150 ease-out">
                        <IoClose/>
                    </button>}
            </div>
            <input id="eventImageFileInput" type="file" name="image" accept="image/*" className="hidden" onChange={imageUpload}/>
        </div>

        <Field label="Title" required>
            <input className={inputClass} type="text" name="title" value={title} placeholder="Friday night halaqa"
                   onChange={(e) => setTitle(e.target.value)}/>
        </Field>

        <Field label="Description">
            <textarea className={`${inputClass} resize-y min-h-[4.5rem]`} name="description" value={description}
                      placeholder="A short line shown on the event card"
                      onChange={(e) => setDescription(e.target.value)}/>
        </Field>

        <div className="flex flex-row gap-3">
            <div className="flex-1">
                <Field label="Date">
                    <input className={inputClass} type="date" name="date" value={date}
                           onChange={(e) => setDate(e.target.value)}/>
                </Field>
            </div>
            <div className="flex-1">
                <Field label="Time">
                    <input className={inputClass} type="time" name="time" value={time}
                           onChange={(e) => setTime(e.target.value)}/>
                </Field>
            </div>
        </div>

        <Button component="div" size="lg" disabled={submitting || compressing} onClick={onSubmit}
                className="!bg-accent-100 hover:!bg-accent-200 !text-white disabled:!opacity-50">
            {editing ? "Save Changes" : "Add Event"}
        </Button>
    </div>
}

const inputClass = "w-full p-2 text-sm rounded-md bg-bg-200 border border-bg-300 text-text-100 placeholder:text-text-200 placeholder:opacity-50 focus:outline-none focus:border-accent-100 transition duration-150 ease-out";

function Field(props: {label: string, required?: boolean, children: React.ReactNode})
{
    return <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text-200">
            {props.label}
            {props.required ?
                <span className="text-red-400"> *</span>
                :
                <span className="opacity-60 font-normal"> (optional)</span>}
        </label>
        {props.children}
    </div>
}

async function saveNewEvent(details: Event, image: File) : Promise<Event>
{
    const toastId = toast.loading("Adding event…");

    const event = await addEvent(details);
    if(!event)
    {
        toast.error("Failed to add event", {id: toastId});
        return null;
    }

    if(image == null || image.size == 0)
    {
        toast.success("Event added", {id: toastId});
        return event;
    }

    toast.loading("Uploading image…", {id: toastId});
    const withImage = await uploadEventImage(event, image);
    if(withImage == null)
    {
        // The event itself exists, so report that rather than a flat failure.
        toast.error("Event added, but the image failed to upload", {id: toastId});
        return event;
    }

    toast.success("Event added", {id: toastId});
    return withImage;
}

async function saveExistingEvent(details: Event, image: File, imageCleared: boolean) : Promise<Event>
{
    const toastId = toast.loading("Saving changes…");

    // A cleared image is removed from storage and from the row.
    if(imageCleared && details.image != null && image == null)
    {
        toast.loading("Removing image…", {id: toastId});
        await deleteImage(details);
        details = {...details, image: null, imageUrl: null};
    }

    const event = await updateEvent(details);
    if(!event)
    {
        toast.error("Failed to save changes", {id: toastId});
        return null;
    }

    if(image == null || image.size == 0)
    {
        toast.success("Event updated", {id: toastId});
        return event;
    }

    toast.loading("Uploading image…", {id: toastId});
    const withImage = await uploadEventImage(event, image);
    if(withImage == null)
    {
        toast.error("Event updated, but the image failed to upload", {id: toastId});
        return event;
    }

    toast.success("Event updated", {id: toastId});
    return withImage;
}

async function uploadEventImage(event: Event, image: File) : Promise<Event>
{
    const formData = new FormData();
    formData.append("image", image);

    try
    {
        return await uploadImage(event, formData);
    }
    catch (error)
    {
        // Reported by the caller, which knows whether the event itself saved.
        console.error("Failed to upload event image: " + describeError(error, "unknown error"));
        return null;
    }
}

/**
 * Builds the event date from the local date/time inputs. Letting Date parse the
 * combined string is unreliable: a bare "yyyy-mm-dd" is read as UTC midnight
 * (which then renders as a 1am event in BST) while a string with a time is read
 * as local.
 */
function parseDateTime(dateString: string, timeString: string) : Date
{
    if(dateString == null || dateString == "")
        return null;

    const [year, month, day] = dateString.split('-').map(Number);
    let hours = 0;
    let minutes = 0;
    if(timeString != null && timeString != "")
    {
        [hours, minutes] = timeString.split(':').map(Number);
    }

    const date = new Date(year, month - 1, day, hours, minutes);
    return isNaN(date.getTime()) ? null : date;
}

function toDateInput(date: Date) : string
{
    if(date == null)
        return "";

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInput(date: Date) : string
{
    if(date == null || (date.getHours() == 0 && date.getMinutes() == 0))
        return "";

    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value: number) : string
{
    return String(value).padStart(2, '0');
}
