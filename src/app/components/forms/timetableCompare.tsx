"use client"
import {Button} from "@mui/joy";
import {useMemo, useState} from "react";
import {DailyPrayer} from "@/lib/entities/dailyprayer";
import {ParsedTimetable} from "@/lib/utils/timetable";

const TIME_FIELDS = ["fajr_adhan", "fajr_iqama", "sunrise", "dhuhr_adhan", "dhuhr_iqama",
                     "asr_adhan", "asr_iqama", "mughrib_adhan", "isha_adhan", "isha_iqama"] as const;

type Choice = "old" | "new";

type DayPair =
{
    day: number,
    old?: DailyPrayer,
    incoming?: DailyPrayer,
    /** Fields that differ between the two, ignoring formatting. */
    differences: string[]
};

/**
 * Side-by-side comparison of the month already saved against the one just read,
 * letting the admin choose per day which version to keep.
 */
export default function TimetableCompare(props: {
    timetable: ParsedTimetable,
    existing: DailyPrayer[],
    busy: boolean,
    onCancel: () => void,
    onSave: (chosen: DailyPrayer[]) => void
})
{
    const pairs = useMemo(() => buildPairs(props.existing, props.timetable.prayers), [props.existing, props.timetable]);

    // Default to the incoming version wherever there is one.
    const [choices, setChoices] = useState<Record<number, Choice>>(() =>
    {
        const initial: Record<number, Choice> = {};
        pairs.forEach((pair) => initial[pair.day] = pair.incoming != null ? "new" : "old");
        return initial;
    });

    const setAll = (choice: Choice) =>
    {
        const updated: Record<number, Choice> = {};
        pairs.forEach((pair) =>
        {
            // A day that only exists on one side cannot take the other.
            if(choice == "new" && pair.incoming == null)
                updated[pair.day] = "old";
            else if(choice == "old" && pair.old == null)
                updated[pair.day] = "new";
            else
                updated[pair.day] = choice;
        });
        setChoices(updated);
    };

    const chosen = pairs
        .map((pair) => choices[pair.day] == "old" ? pair.old : pair.incoming)
        .filter((prayer) => prayer != null);

    const changedDays = pairs.filter((pair) => pair.differences.length > 0).length;
    const onlyOld = pairs.filter((pair) => pair.incoming == null).length;
    const onlyNew = pairs.filter((pair) => pair.old == null).length;
    const keepingNew = pairs.filter((pair) => choices[pair.day] == "new").length;

    return <div className="flex flex-col gap-3">
        <div className="flex flex-row flex-wrap gap-2 justify-between items-baseline">
            <h3 className="text-lg font-semibold">Compare {props.timetable.monthLabel}</h3>
            <span className="text-sm text-text-200">
                keeping {keepingNew} new / {pairs.length - keepingNew} existing
            </span>
        </div>

        <p className="text-sm text-text-200">
            {changedDays == 0 ?
                "The two versions are identical — there is nothing to change."
                :
                `${changedDays} ${changedDays == 1 ? "day differs" : "days differ"}. Differing times are highlighted; pick which version to keep for each day.`}
            {onlyOld > 0 && ` ${onlyOld} ${onlyOld == 1 ? "day is" : "days are"} only in the saved version.`}
            {onlyNew > 0 && ` ${onlyNew} ${onlyNew == 1 ? "day is" : "days are"} only in the new version.`}
        </p>

        <div className="flex flex-row gap-2">
            <Button component="div" size="sm" variant="outlined" color="neutral" onClick={() => setAll("old")}
                    className="!border-bg-300 !text-text-100 hover:!bg-bg-200">
                Keep all existing
            </Button>
            <Button component="div" size="sm" variant="outlined" color="neutral" onClick={() => setAll("new")}
                    className="!border-bg-300 !text-text-100 hover:!bg-bg-200">
                Keep all new
            </Button>
        </div>

        <div className="max-h-[45vh] overflow-auto border border-bg-300 rounded-md">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-bg-200 text-text-100">
                    <tr>
                        <th className="p-2 font-semibold">Day</th>
                        <th className="p-2 font-semibold">Keep</th>
                        <th className="p-2 font-semibold">Fajr</th>
                        <th className="p-2 font-semibold">Sunrise</th>
                        <th className="p-2 font-semibold">Dhuhr</th>
                        <th className="p-2 font-semibold">Asr</th>
                        <th className="p-2 font-semibold">Maghrib</th>
                        <th className="p-2 font-semibold">Isha</th>
                    </tr>
                </thead>
                <tbody>
                    {pairs.map((pair) =>
                        <DayRows key={pair.day} pair={pair} choice={choices[pair.day]}
                                 onChoose={(choice) => setChoices({...choices, [pair.day]: choice})}/>)}
                </tbody>
            </table>
        </div>

        <div className="flex flex-row flex-wrap gap-2 justify-end">
            <Button component="div" variant="plain" color="neutral" disabled={props.busy} onClick={props.onCancel}>
                Cancel
            </Button>
            <Button component="div" size="lg" color="danger" disabled={props.busy || chosen.length == 0}
                    onClick={() => props.onSave(chosen)}>
                Replace with {chosen.length} days
            </Button>
        </div>
    </div>
}

function DayRows(props: {pair: DayPair, choice: Choice, onChoose: (choice: Choice) => void})
{
    const {pair} = props;
    const differs = (field: string) => pair.differences.includes(field);

    const row = (version: Choice, prayer: DailyPrayer, label: string) =>
    {
        const selected = props.choice == version;
        const missing = prayer == null;

        return <tr onClick={() => !missing && props.onChoose(version)}
                   className={`border-t border-bg-300 ${missing ? "opacity-40" : "cursor-pointer"} ${selected ? "bg-accent-100/15" : "hover:bg-bg-200"}`}>
            {version == "old" &&
                <td className="p-2 font-semibold align-top" rowSpan={2}>{pair.day}</td>}
            <td className="p-2 whitespace-nowrap">
                <span className={selected ? "font-semibold text-accent-100" : "text-text-200"}>
                    {selected ? "● " : "○ "}{label}
                </span>
            </td>
            {missing ?
                <td className="p-2 italic text-text-200" colSpan={6}>not in this version</td>
                :
                <>
                    <Cell adhan={prayer.fajr_adhan} iqama={prayer.fajr_iqama}
                          changed={differs("fajr_adhan") || differs("fajr_iqama")}/>
                    <Cell adhan={prayer.sunrise} changed={differs("sunrise")}/>
                    <Cell adhan={prayer.dhuhr_adhan} iqama={prayer.dhuhr_iqama}
                          changed={differs("dhuhr_adhan") || differs("dhuhr_iqama")}/>
                    <Cell adhan={prayer.asr_adhan} iqama={prayer.asr_iqama}
                          changed={differs("asr_adhan") || differs("asr_iqama")}/>
                    <Cell adhan={prayer.mughrib_adhan} changed={differs("mughrib_adhan")}/>
                    <Cell adhan={prayer.isha_adhan} iqama={prayer.isha_iqama}
                          changed={differs("isha_adhan") || differs("isha_iqama")}/>
                </>}
        </tr>;
    };

    return <>
        {row("old", pair.old, "saved")}
        {row("new", pair.incoming, "new")}
    </>
}

function Cell(props: {adhan: string, iqama?: string, changed: boolean})
{
    return <td className={`p-2 whitespace-nowrap ${props.changed ? "bg-amber-500/20 font-semibold" : ""}`}>
        <span className={props.adhan ? "" : "text-red-400"}>{time(props.adhan) || "—"}</span>
        {props.iqama !== undefined &&
            <span className="opacity-60"> ({time(props.iqama) || "—"})</span>}
    </td>
}

function buildPairs(existing: DailyPrayer[], incoming: DailyPrayer[]) : DayPair[]
{
    const byDay = new Map<number, DayPair>();

    const slot = (day: number) =>
    {
        if(!byDay.has(day))
            byDay.set(day, {day: day, differences: []});
        return byDay.get(day);
    };

    existing.forEach((prayer) => slot(dayOf(prayer.date)).old = prayer);
    incoming.forEach((prayer) => slot(dayOf(prayer.date)).incoming = prayer);

    const pairs = Array.from(byDay.values()).sort((a, b) => a.day - b.day);
    pairs.forEach((pair) =>
    {
        if(pair.old == null || pair.incoming == null)
            return;

        // Compared on "HH:MM" so that stored seconds ("05:00:00") don't read as
        // a difference against a freshly parsed "05:00".
        TIME_FIELDS.forEach((field) =>
        {
            if(time(pair.old[field]) != time(pair.incoming[field]))
                pair.differences.push(field);
        });
    });

    return pairs;
}

/** Handles both a date column ("2026-09-01") and a full ISO timestamp. */
function dayOf(date: string) : number
{
    const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match == null ? NaN : parseInt(match[3]);
}

function time(value: string) : string
{
    return value == null ? "" : String(value).slice(0, 5);
}
