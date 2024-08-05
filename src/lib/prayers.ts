"use server"
import supabase, { toSupabaseDate } from "@/lib/supabase";
import { DailyPrayer } from "./entities/dailyprayer";

export async function getDailyPrayers(date: Date) : Promise<DailyPrayer>
{
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

export async function addPrayer(prayer: DailyPrayer) : Promise<boolean>
{
    const result = await supabase.from("DailyPrayers").insert([prayer]);

    if(result.error != null)
    {
        console.error("Failed to add prayer. Error: " + result.error.message);
        return false;
    }

    return true;
}

export async function getPrayerDates() : Promise<Date[]>
{
    const result = await supabase.from("DailyPrayers").select("date");

    if(result.error != null)
    {
        console.error("Failed to get prayer dates. Error: " + result.error.message);
        return null;
    }

    return result.data.map((result) => new Date(result.date));
}

export async function removePrayerTimes(from: Date, to: Date) : Promise<boolean>
{
    const result = await supabase.from("DailyPrayers").delete().gte("date", from.toISOString()).lte("date", to.toISOString());

    if(result.error != null)
    {
        console.error("Failed to remove prayer times. Error: " + result.error.message);
        return false;
    }
    return true;
}