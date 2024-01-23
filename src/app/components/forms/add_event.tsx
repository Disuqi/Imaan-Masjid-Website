"use client"
import {BsFillImageFill} from "react-icons/bs";
import {Button} from "@mui/joy";
import {FormEvent, useState} from "react";

export default function AddEventForm(props: {onSubmit: (event: FormEvent) => void})
{
    const [image, setImage]= useState(null);

    const imageUpload = (e) =>
    {
        const file = e.target.files[0];
        if(file)
        {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    return <div className="flex flex-col justify-center items-center">
        <form className="flex flex-col gap-2 justify-center items-start" onSubmit={props.onSubmit}>
            <div className="flex flex-col">
                <label className="text-sm text-gray-300">Image</label>
                <label className="w-96 h-52 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 transition duration-100 ease-out cursor-pointer" htmlFor="eventImageFileInput">
                    {image ?
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
                <Button type="submit">Add Event</Button>
            </div>
        </form>
    </div>
}