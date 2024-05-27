import {format} from "date-fns";

export async function apiFormattedHijriDate(date: Date): Promise<string>
{
    const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${format(date, "dd-MM-yyyy")}`);
    const data = (await response.json()).data;
    return data.hijri.day + " " + data.hijri.month.en + " " + data.hijri.year + " " + data.hijri.designation.abbreviated;
}

export async function apiHijriMonth(date: Date)
{
    const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${format(date, "dd-MM-yyyy")}`);
    const data = (await response.json()).data;
    return data.hijri.month.en;
}

export function formatDateWithSuffix(date: Date) {
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    // @ts-ignore
    const formatter = new Intl.DateTimeFormat('en-UK', options);
    let formattedDate = formatter.format(date);

    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);

    return formattedDate.replace(/\d+/, (match) => match + ordinalSuffix);
}

export function getMonth(date: Date)
{
    const options = {
        month: 'long',
    };
    // @ts-ignore
    return date.toLocaleDateString('en-UK', options);
}

export function getOrdinalSuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function formatSupabaseTime(supabaseTime: string) : string
{
    return supabaseTime.substring(0, 5);
}

export function getUkTime(date: Date) : string
{
    const options : Intl.DateTimeFormatOptions =
        {
            timeZone: "Europe/London",
            hour12: true,
            hour: "numeric",
            minute: "numeric",
        }
    return date.toLocaleString("en-GB", options);
}