import { DailyPrayer } from "@/lib/entities/dailyprayer";

export const TIMETABLE_COLUMN_COUNT = 12;

/**
 * One day of times as read out of a source file, before it becomes a
 * DailyPrayer. Both the CSV parser and the PDF conversion produce these, so the
 * date handling below stays in a single place.
 */
export type TimetableRow =
{
    day: number | string,
    hijri: number | string,
    fajr_adhan: string,
    fajr_iqama: string,
    sunrise: string,
    dhuhr_adhan: string,
    dhuhr_iqama: string,
    asr_adhan: string,
    asr_iqama: string,
    mughrib_adhan: string,
    isha_adhan: string,
    isha_iqama: string
}

export type ParsedTimetable =
{
    year: number,
    /** Zero-based, matching Date. */
    month: number,
    monthLabel: string,
    prayers: DailyPrayer[]
}

export function monthLabel(year: number, month: number) : string
{
    return new Date(Date.UTC(year, month)).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
}

export function monthStart(year: number, month: number) : Date
{
    return new Date(Date.UTC(year, month, 1));
}

export function monthEnd(year: number, month: number) : Date
{
    return new Date(Date.UTC(year, month + 1, 0));
}

/**
 * Turns rows into DailyPrayer records. Dates are built in UTC so the stored
 * value matches what the timetable queries for, whatever timezone the admin
 * uploading the file happens to be in.
 */
export function buildTimetable(year: number, month: number, rows: TimetableRow[]) : ParsedTimetable
{
    const seenDays = new Set<number>();
    const daysInMonth = monthEnd(year, month).getUTCDate();
    const prayers : DailyPrayer[] = [];

    for(const row of rows)
    {
        if(row == null)
            continue;

        const day = parseDayNumber(row.day);
        if(day == null || day < 1 || day > daysInMonth || seenDays.has(day))
            continue;
        seenDays.add(day);

        prayers.push({
            date: new Date(Date.UTC(year, month, day)).toISOString(),
            hijri: parseHijri(row.hijri),
            fajr_adhan: normaliseTime(row.fajr_adhan),
            fajr_iqama: normaliseTime(row.fajr_iqama),
            sunrise: normaliseTime(row.sunrise),
            dhuhr_adhan: normaliseTime(row.dhuhr_adhan),
            dhuhr_iqama: normaliseTime(row.dhuhr_iqama),
            asr_adhan: normaliseTime(row.asr_adhan),
            asr_iqama: normaliseTime(row.asr_iqama),
            mughrib_adhan: normaliseTime(row.mughrib_adhan),
            isha_adhan: normaliseTime(row.isha_adhan),
            isha_iqama: normaliseTime(row.isha_iqama)
        });
    }

    prayers.sort((a, b) => a.date.localeCompare(b.date));

    return {
        year: year,
        month: month,
        monthLabel: monthLabel(year, month),
        prayers: prayers
    };
}

/**
 * Reads the leading number out of a day cell.
 *
 * Timetables sometimes print the first cell of the date column as "01-Sep"
 * rather than "01". Number("01-Sep") is NaN, which would drop the row silently,
 * so the leading digits are taken instead.
 */
function parseDayNumber(value: number | string) : number
{
    if(typeof value == "number")
        return Number.isInteger(value) ? value : null;

    if(value == null)
        return null;

    const match = String(value).trim().match(/^(\d{1,2})/);
    return match == null ? null : parseInt(match[1]);
}

/** 0 is the schema's "no Hijri column" sentinel, so it is stored as absent. */
function parseHijri(value: number | string) : number
{
    const hijri = parseDayNumber(value);
    if(hijri == null || hijri < 1 || hijri > 30)
        return null;

    return hijri;
}

/** Trims stray whitespace and CRs, and pads "5:30" out to "05:30". */
function normaliseTime(value: string) : string
{
    if(value == null)
        return null;

    const trimmed = String(value).trim();
    if(trimmed == "")
        return null;

    const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
    if(match == null)
        return trimmed;

    return `${match[1].padStart(2, '0')}:${match[2]}`;
}

const MONTH_ABBREVIATIONS: { [key: string]: number } = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/** Parses a CSV header cell such as "Aug-25" or "August-2025". */
export function parseMonthYearString(dateString: string) : { year: number, month: number } | null
{
    if(dateString == null)
        return null;

    const [monthStr, yearStr] = dateString.split('-');
    if(monthStr == null || yearStr == null)
        return null;

    const month = MONTH_ABBREVIATIONS[monthStr.trim().slice(0, 3).toLowerCase()];
    let year = parseInt(yearStr.trim());

    if(month === undefined || isNaN(year))
        return null;

    if(year < 100)
        year += 2000;

    return { year: year, month: month };
}
