"use client"
import {BsFillImageFill} from "react-icons/bs";
import {Button} from "@mui/joy";
import {useState} from "react";
import {Event} from "@/app/entities/event";
import supabase from "@/lib/supabase";
import toast from "react-hot-toast";

export default function AddEventForm(props: {onStart: () => void, onComplete: () => void})
{
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({});

    const imageUpload = (e) =>
    {
        const file = e.target.files[0];
        if(file)
        {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
        setFormData({...formData, "image": file})
    };

    const onSubmit = async () =>
    {
        props.onStart();
        //@ts-ignore
        await addEvent(formData);
        props.onComplete();
    };

    const handleInputChange = (e) =>
    {
        if (e.target.name == "image")
            return;
        setFormData({...formData, [e.target.name]: e.target.value});
    }
    return <div className="flex flex-col justify-center items-center">
        <form className="flex flex-col gap-2 justify-center items-start" onChange={handleInputChange}>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Image</label>
                <label className="md:w-96 md:h-52 w-72 h-40 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 transition duration-100 ease-out cursor-pointer" htmlFor="eventImageFileInput">
                    {image ?
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} className="w-full h-full object-cover" alt="Uploaded Image"/>
                        :
                        <BsFillImageFill className="w-full h-full p-10" />
                    }
                </label>
                <input id="eventImageFileInput" type="file" name="image" accept="image/*" className="hidden" onInput={imageUpload}/>
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Title</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="text" name="title"/>
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Description</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="text" name="description"/>
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Date</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="date" name="date"/>
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Time</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="time" name="time"/>
            </div>
            <div className="text-center w-full mt-2">
                <Button component="div" onClick={onSubmit}>Submit</Button>
            </div>
        </form>
    </div>
}


async function addEvent(formData)
{
    const title : string = formData["title"] as string;
    const description : string = formData["description"] as string;
    const dateString : string = formData["date"] as string;
    const timeString : string = formData["time"] as string;
    const image : File = formData["image"] as File;

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
    await uploadAndSetImage(event, image);
}

async function uploadAndSetImage(event : Event, image: File)
{
    const filename = event.title.toLowerCase().replace(/\s/g, '_')
    const uploadImage = await supabase.storage.from("event_images").upload(filename, image)
    if(uploadImage.error != null)
    {
        console.log(uploadImage.error);
        toast.error("Failed to save image");
        return;
    }

    const updateEvent = await supabase.from("Event").update({image: filename}).eq("title", event.title);
    if(updateEvent.error != null)
    {
        console.log(updateEvent.error);
        toast.error("Failed to set image for event");
        return;
    }

    toast.success("Image set for event");
}