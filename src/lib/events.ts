"use server"
import supabase from "@/lib/supabase";
import { Event } from "@/lib/entities/event";

export async function getEvents() : Promise<Event[]>
{
    const result = await supabase.from("Events").select().returns<Event[]>();
    if(result.error != null)
    {
        console.error("Failed to get events. Error: " + result.error.message);
        return [];
    }

    return result.data;
}

export async function addEvent(event: Event) : Promise<boolean>
{
    const result = await supabase.from("Events").insert([event]);
    if(result.error != null)
    {
        console.error("Failed to add event. Error: " + result.error.message);
        return false;
    }
    return true;
}

export async function updateEvent(event: Event) : Promise<boolean>
{
    const result = await supabase.from("Events").update(event).eq("title", event.title);
    if(result.error != null)
    {
        console.error("Failed to update event. Error: " + result.error.message);
        return false;
    }   
    return true;
}

export async function deleteEvent(event: Event) : Promise<void>
{
    await supabase.from("Events").delete().eq("title", event.title);
}

export async function uploadImage(event: Event, formData: FormData) : Promise<boolean>
{
    const image = formData.get("image") as File;
    const filename = event.title.toLowerCase().replace(/\s/g, '_');
    const result = await supabase.storage.from("event_images").upload(filename, image);
    if(result.error != null)
    {
        console.error("Failed to upload image. Error: " + result.error.message);
        return false;    
    }
    event.image = filename;
    event.imageUrl = (await supabase.storage.from("event_images").getPublicUrl(filename)).data.publicUrl;
    return await updateEvent(event);
}

export async function deleteImage(event: Event) : Promise<void>
{
    await supabase.storage.from("event_images").remove([event.image]);
}