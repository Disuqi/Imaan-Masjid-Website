"use server"
import supabase from "@/lib/supabase";
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
    const result = await supabase.from("DailyPrayers").select("date").returns<string[]>();

    if(result.error != null)
    {
        console.error("Failed to get prayer dates. Error: " + result.error.message);
        return null;
    }

    return result.data.map((dateS : string) => new Date(dateS));
}

export async function removePrayerTimes(firstDate: Date, lastDate: Date) : Promise<boolean>
{
    const result = await supabase.from("DailyPrayers").delete().gte("date", firstDate.toISOString()).lte("date", lastDate.toISOString());

    if(result.error != null)
    {
        console.error("Failed to remove prayer times. Error: " + result.error.message);
        return false;
    }
    return true;
}