"use server"
import { createAdminSupabaseClient, createSupabaseClient } from "@/lib/supabase";
import { DailyPrayer } from "./entities/dailyprayer";

export async function getDailyPrayers(date: Date) : Promise<DailyPrayer>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.from("DailyPrayers").select().eq("date", date.toISOString()).single<DailyPrayer>();
    if(result.error != null)
    {
        console.error("Failed to get prayers. Error: " + result.error.message);
        return null;
    }
    return result.data;
}

export async function getPrayers(from: Date, to: Date) : Promise<DailyPrayer[]>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.from("DailyPrayers")
    .select()
    .gte("date", from.toISOString())
    .lte("date", to.toISOString())
    .order("date")
    .returns<DailyPrayer[]>();

    if(result.error != null)
    {
        console.error("Failed to get prayers. Error: " + result.error.message);
        return [];
    }
    return result.data;
}

export async function addPrayers(prayers: DailyPrayer[]) : Promise<boolean>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return false;

    if(prayers.length == 0)
        return true;

    const result = await supabase.from("DailyPrayers").insert(prayers);

    if(result.error != null)
    {
        console.error("Failed to add prayers. Error: " + result.error.message);
        return false;
    }

    return true;
}

export async function getPrayerDates() : Promise<Date[]>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.from("DailyPrayers").select("date");

    if(result.error != null)
    {
        console.error("Failed to get prayer dates. Error: " + result.error.message);
        return null;
    }

    return result.data.map((result) => new Date(result.date));
}

/**
 * Swaps a month's prayer times for a new set, in one guarded operation.
 *
 * Deleting before inserting is unavoidable (the date column is unique once
 * migration 001 is applied), which leaves a window where the month is empty.
 * The existing rows are therefore read first and put back if the insert fails,
 * so a failure cannot leave the month blank.
 */
export async function replacePrayerTimes(from: Date, to: Date, prayers: DailyPrayer[]) : Promise<{success: boolean, error?: string}>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return {success: false, error: "You need to be signed in to replace prayer times"};

    if(prayers.length == 0)
        return {success: false, error: "No prayer times to save"};

    const range = () => supabase.from("DailyPrayers").delete()
        .gte("date", from.toISOString()).lte("date", to.toISOString());

    const backup = await supabase.from("DailyPrayers").select("*")
        .gte("date", from.toISOString()).lte("date", to.toISOString());
    if(backup.error != null)
    {
        console.error("Failed to read the existing prayer times. Error: " + backup.error.message);
        return {success: false, error: "Could not read the existing times, so nothing was changed"};
    }

    const removed = await range();
    if(removed.error != null)
    {
        console.error("Failed to clear the month. Error: " + removed.error.message);
        return {success: false, error: "Could not clear the existing times, so nothing was changed"};
    }

    // Ids are assigned by the database; a kept row carries its old one.
    const inserted = await supabase.from("DailyPrayers")
        .insert(prayers.map(({...prayer}) => { delete (prayer as {id?: number}).id; return prayer; }));

    if(inserted.error == null)
        return {success: true};

    console.error("Failed to insert the new prayer times. Error: " + inserted.error.message);

    // Put the month back exactly as it was, ids included.
    await range();
    const restored = await supabase.from("DailyPrayers").insert(backup.data);
    if(restored.error != null)
    {
        console.error("CRITICAL: could not restore the previous prayer times. Error: " + restored.error.message);
        return {success: false, error: "Saving failed AND the previous times could not be restored — please re-upload this month"};
    }

    return {success: false, error: "Saving failed, so the previous times were put back"};
}

export async function removePrayerTimes(from: Date, to: Date) : Promise<boolean>
{
    const supabase = await createAdminSupabaseClient();
    if(supabase == null)
        return false;

    const result = await supabase.from("DailyPrayers").delete().gte("date", from.toISOString()).lte("date", to.toISOString());

    if(result.error != null)
    {
        console.error("Failed to remove prayer times. Error: " + result.error.message);
        return false;
    }
    return true;
}
