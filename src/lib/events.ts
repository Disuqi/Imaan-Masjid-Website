"use server"
import supabase from "@/lib/supabase";
import { Event } from "@/lib/entities/event";

export async function getEvents() : Promise<Event[]>
{
    const result = await supabase.from("Event").select().returns<Event[]>();
    if(result.error != null)
    {
        console.error("Failed to get events. Error: " + result.error.message);
        return [];
    }

    return result.data;
}

export async function addEvent(event: Event) : Promise<Event>
{
    const result = await supabase.from("Event").insert(event).select().returns<Event>();
    if(result.error != null)
    {
        console.error("Failed to add event. Error: " + result.error.message);
        return null;
    }
    return result.data[0];
}

export async function updateEvent(event: Event) : Promise<boolean>
{
    const result = await supabase.from("Event").update(event).eq("title", event.title);
    if(result.error != null)
    {
        console.error("Failed to update event. Error: " + result.error.message);
        return false;
    }   
    return true;
}

export async function deleteEvent(event: Event) : Promise<boolean> {
    const result = await supabase.from("Event").delete().eq("id", event.id);

    if (result.error != null)
    {
        console.error("Failed to delete event. Error: " + result.error.message);
        return false;
    }

    return true;
}

export async function uploadImage(event: Event, formData: FormData) : Promise<boolean>
{
    const image = formData.get("image") as File;
    const filename = event.id.toString() + ".jpeg";
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

export async function deleteImage(event: Event) : Promise<boolean>
{
    const result = await supabase.storage.from("event_images").remove([event.image]);
    if(result.error != null)
    {
        console.error("Failed to delete image. Error: " + result.error.message);
        return false;
    }
    return true;
}