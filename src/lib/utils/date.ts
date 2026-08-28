import {format} from "date-fns";

/**
 * Hijri dates come from a third-party API, so every call here can fail or come
 * back in an unexpected shape. Both helpers return null on failure instead of
 * throwing: the Hijri date is decoration next to the prayer times, and it must
 * never take a page down with it.
 */
type HijriDate =
{
    day?: string,
    month?: { en?: string },
    year?: string,
    designation?: { abbreviated?: string }
};

async function fetchHijri(date: Date) : Promise<HijriDate>
{
    try
    {
        const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${format(date, "dd-MM-yyyy")}`,
            { signal: AbortSignal.timeout(8000) });

        if(!response.ok)
        {
            console.error(`Hijri date lookup failed with HTTP ${response.status}`);
            return null;
        }

        const hijri = (await response.json())?.data?.hijri as HijriDate;
        return hijri ?? null;
    }
    catch (error)
    {
        console.error("Hijri date lookup failed: " + (error instanceof Error ? error.message : String(error)));
        return null;
    }
}

export async function apiFormattedHijriDate(date: Date): Promise<string>
{
    const hijri = await fetchHijri(date);
    if(hijri?.day == null || hijri?.month?.en == null || hijri?.year == null)
        return null;

    const designation = hijri.designation?.abbreviated ?? "";
    return `${hijri.day} ${hijri.month.en} ${hijri.year} ${designation}`.trim();
}

export async function apiHijriMonth(date: Date) : Promise<string>
{
    const hijri = await fetchHijri(date);
    return hijri?.month?.en ?? null;
}

export function formatDateWithSuffix(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const formatter = new Intl.DateTimeFormat('en-UK', options);
    const formattedDate = formatter.format(date);

    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);

    return formattedDate.replace(/\d+/, (match) => match + ordinalSuffix);
}

export function getMonth(date: Date)
{
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
    };
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