"use server"
import { createAdminSupabaseClient, createSupabaseClient } from "@/lib/supabase";
import { Event } from "@/lib/entities/event";
import { MAX_UPLOAD_BYTES, formatBytes } from "@/lib/utils/upload";

const IMAGE_BUCKET = "event_images";
const ALLOWED_IMAGE_TYPES: { [mimeType: string]: string } =
{
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif"
};

export async function getEvents() : Promise<Event[]>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.from("Event")
        .select()
        // Sorted here so every caller gets a stable, chronological list.
        .order("date", { ascending: true, nullsFirst: false })
        .returns<Event[]>();

    if(result.error != null)
    {
        console.error("Failed to get events. Error: " + result.error.message);
        return [];
    }

    return result.data;
}

export async function addEvent(event: Event) : Promise<Event>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return null;

    const result = await supabase.from("Event").insert(event).select().returns<Event[]>();
    if(result.error != null)
    {
        console.error("Failed to add event. Error: " + result.error.message);
        return null;
    }
    return result.data[0];
}

export async function updateEvent(event: Event) : Promise<Event>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return null;

    if(event.id == null)
    {
        console.error("Failed to update event: no id");
        return null;
    }

    // Matched on id, not title — otherwise renaming an event updates nothing.
    const result = await supabase.from("Event").update(event).eq("id", event.id).select().returns<Event[]>();
    if(result.error != null)
    {
        console.error("Failed to update event. Error: " + result.error.message);
        return null;
    }
    return result.data[0];
}

export async function deleteEvent(event: Event) : Promise<boolean>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return false;

    const result = await supabase.from("Event").delete().eq("id", event.id);
    if (result.error != null)
    {
        console.error("Failed to delete event. Error: " + result.error.message);
        return false;
    }

    return true;
}

/**
 * Uploads a cover image and returns the event with its image fields filled in,
 * so the caller can update its copy without a refetch.
 */
export async function uploadImage(event: Event, formData: FormData) : Promise<Event>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return null;

    const image = formData.get("image") as File;
    if(image == null || image.size == 0)
    {
        console.error("Failed to upload image: no file");
        return null;
    }
    if(image.size > MAX_UPLOAD_BYTES)
    {
        console.error("Failed to upload image: larger than " + formatBytes(MAX_UPLOAD_BYTES));
        return null;
    }

    // The extension has to follow the actual file: everything used to be stored
    // as ".jpeg" regardless of what was uploaded.
    const extension = ALLOWED_IMAGE_TYPES[image.type];
    if(extension == null)
    {
        console.error("Failed to upload image: unsupported type " + image.type);
        return null;
    }

    const filename = event.id.toString() + "." + extension;
    const result = await supabase.storage.from(IMAGE_BUCKET).upload(filename, image, {
        contentType: image.type,
        // Replacing an event's image would otherwise fail on the existing object.
        upsert: true
    });
    if(result.error != null)
    {
        console.error("Failed to upload image. Error: " + result.error.message);
        return null;
    }

    // A previous image in a different format is now orphaned, so clean it up.
    if(event.image != null && event.image != filename)
        await supabase.storage.from(IMAGE_BUCKET).remove([event.image]);

    const publicUrl = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filename).data.publicUrl;
    const updated : Event = {
        ...event,
        image: filename,
        // Cache-busted so a replaced image isn't served from the old cache entry.
        imageUrl: `${publicUrl}?v=${Date.now()}`
    };

    return await updateEvent(updated);
}

export async function deleteImage(event: Event) : Promise<boolean>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return false;

    if(event.image == null)
        return true;

    const result = await supabase.storage.from(IMAGE_BUCKET).remove([event.image]);
    if(result.error != null)
    {
        console.error("Failed to delete image. Error: " + result.error.message);
        return false;
    }
    return true;
}
