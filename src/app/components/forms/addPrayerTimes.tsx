"use client"
import {Button} from "@mui/joy";
import {useRef, useState} from "react";
import toast from "react-hot-toast";
import {addPrayers, getPrayers, removePrayerTimes, replacePrayerTimes} from "@/lib/prayers";
import {convertTimetablePdf} from "@/lib/timetable_pdf";
import {
    buildTimetable,
    csvFilename,
    monthEnd,
    monthStart,
    ParsedTimetable,
    parseMonthYearString,
    TIMETABLE_COLUMN_COUNT,
    TimetableRow,
    toCsv,
    withEditedTime
} from "@/lib/utils/timetable";
import {BsFiletypeCsv, BsFiletypePdf} from "react-icons/bs";
import TimetableCompare from "@/app/components/forms/timetableCompare";
import {DailyPrayer} from "@/lib/entities/dailyprayer";
import {describeError} from "@/lib/utils/errors";
import {checkUploadSize, formatBytes, MAX_UPLOAD_BYTES} from "@/lib/utils/upload";
import {rasterizePdf} from "@/lib/utils/compress";
import {IoDownloadOutline, IoPencilOutline, IoSparkles} from "react-icons/io5";

// Rows are sent in small batches so the upload is a handful of round-trips
// instead of one per day, while still reporting progress as it goes.
const BATCH_SIZE = 8;

export default function AddPrayerTimesForm(props: {
    onLoading: (text: string) => void,
    onComplete: (success: boolean) => void
})
{
    const [file, setFile] = useState<File>(null);
    const [parsed, setParsed] = useState<ParsedTimetable>(null);
    // Set when the month already has times: holds both versions for comparison.
    const [conflict, setConflict] = useState<{timetable: ParsedTimetable, existing: DailyPrayer[]}>(null);
    const [comparing, setComparing] = useState(false);
    const [busy, setBusy] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isPdf = file != null && (file.type == "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    const handleInputChange = (e) =>
    {
        setParsed(null);
        setConflict(null);
        setComparing(false);
        setFile(e.target.files?.[0] ?? null);
    }

    const startOver = () =>
    {
        setParsed(null);
        setConflict(null);
        setComparing(false);
        setFile(null);
        if(inputRef.current)
            inputRef.current.value = "";
    }

    /**
     * Refuses a month that already has times, rather than letting the insert
     * collide with it. Every path funnels through here: a partial overlap that
     * fails mid-upload triggers a rollback across the whole month, which would
     * take the pre-existing days with it.
     */
    const presentForReview = async (timetable: ParsedTimetable) =>
    {
        props.onLoading(`Checking existing times for ${timetable.monthLabel}…`);
        const existing = await getPrayers(
            monthStart(timetable.year, timetable.month),
            monthEnd(timetable.year, timetable.month));

        if(existing.length > 0)
        {
            // Not an outright refusal: the admin is shown both versions and
            // decides. Still nothing is written without another confirmation.
            setConflict({timetable: timetable, existing: existing});
            return;
        }

        setParsed(timetable);
    }

    /**
     * Shared tail end: send whatever was prepared for conversion, then show the
     * transcribed rows for review.
     */
    const runConversion = async (formData: FormData) =>
    {
        props.onLoading("Reading the timetable…");

        const result = await readTimetable(formData);
        if(result.error != null)
        {
            // Errors stay as toasts: the dialog has no other way to show them.
            toast.error(result.error);
            return;
        }

        await presentForReview(result.timetable);
    }

    /** Stage one: read the file into rows and show them for review. */
    const onAnalyse = async () =>
    {
        if(busy)
            return;
        if(file == null)
        {
            toast.error("Choose a PDF or CSV file first");
            return;
        }

        setBusy(true);
        props.onLoading(`Reading ${file.name}…`);

        try
        {
            if(!isPdf)
            {
                const csv = await readCsv(file);
                if(csv.error != null)
                {
                    toast.error(csv.error);
                    return;
                }

                await presentForReview(csv.timetable);
                return;
            }

            const formData = new FormData();

            // PDFs are always rasterised: it keeps the upload small and reads
            // reliably. Sending the PDF itself is only a fallback for when
            // rasterising fails outright.
            props.onLoading("Converting PDF to images…");

            try
            {
                const {pages} = await rasterizePdf(file);
                const totalBytes = pages.reduce((sum, page) => sum + page.size, 0);

                if(totalBytes <= MAX_UPLOAD_BYTES)
                    pages.forEach((page) => formData.append("pages", page));
                else
                    console.error(`Rasterised pages came to ${formatBytes(totalBytes)}, over the limit — falling back to the PDF`);
            }
            catch (error)
            {
                // Visible, not just logged: the fallback uploads the whole PDF,
                // which is slower and behaves differently.
                console.error("Could not convert the PDF to images: " + describeError(error, "unknown error"));
                toast.error("Couldn't convert this PDF to images — sending the original instead, which may take longer.");
            }

            if(formData.getAll("pages").length == 0)
            {
                const sizeError = checkUploadSize(file);
                if(sizeError != null)
                {
                    toast.error(sizeError);
                    return;
                }

                formData.append("timetable", file);
            }

            await runConversion(formData);
        }
        catch (error)
        {
            toast.error(describeError(error, "Could not read that file"));
        }
        finally
        {
            setBusy(false);
            props.onLoading(null);
        }
    }

    /** Replaces the month with the mix of versions the admin picked. */
    const onReplace = async (chosen: DailyPrayer[]) =>
    {
        if(busy || conflict == null)
            return;

        setBusy(true);
        const {year, month, monthLabel} = conflict.timetable;
        props.onLoading(`Replacing ${monthLabel}…`);

        try
        {
            const result = await replacePrayerTimes(monthStart(year, month), monthEnd(year, month), chosen);

            if(!result.success)
            {
                toast.error(result.error ?? `Failed to replace ${monthLabel}`);
                return;
            }

            // Reported after the dialog closes, so this is the only confirmation.
            toast.success(`Replaced ${monthLabel} with ${chosen.length} days`);
            props.onComplete(true);
        }
        catch (error)
        {
            toast.error(describeError(error, "Failed to replace the timetable"));
        }
        finally
        {
            setBusy(false);
            props.onLoading(null);
        }
    }

    /** Final stage: the admin has checked the rows, so write them. */
    const onConfirm = async () =>
    {
        if(busy || parsed == null)
            return;

        setBusy(true);
        props.onLoading(`Adding ${parsed.monthLabel}…`);

        let success = false;
        try
        {
            success = await uploadPrayerTimes(parsed, props.onLoading);
        }
        finally
        {
            setBusy(false);
            props.onLoading(null);
        }

        props.onComplete(success);
    }

    if(conflict != null && comparing)
        return <TimetableCompare timetable={conflict.timetable} existing={conflict.existing} busy={busy}
                                 onCancel={startOver} onSave={onReplace}/>

    if(conflict != null)
        return <ConflictStep monthLabel={conflict.timetable.monthLabel}
                             existingDays={conflict.existing.length}
                             incomingDays={conflict.timetable.prayers.length}
                             busy={busy}
                             onCompare={() => setComparing(true)}
                             onCancel={startOver}/>

    if(parsed != null)
        return <ReviewStep timetable={parsed} busy={busy} onConfirm={onConfirm} onStartOver={startOver}
                           onEdited={setParsed}/>

    return <div className="flex flex-col gap-4">
        <label htmlFor="prayer_times_file"
               className="flex flex-col justify-center items-center gap-2 w-full py-8 px-4 border-2 border-dashed border-bg-300 rounded-lg cursor-pointer text-text-200 hover:border-accent-100 hover:bg-bg-200 transition duration-150 ease-out">
            {isPdf ?
                <BsFiletypePdf className="text-3xl text-accent-100"/>
                :
                <BsFiletypeCsv className="text-3xl text-accent-100"/>}
            <span className="text-sm font-semibold text-center break-all">
                {file ? `${file.name} (${formatBytes(file.size)})` : "Click to choose a PDF or CSV file"}
            </span>
            <span className="text-xs opacity-70 text-center">
                {file ?
                    "Click again to pick a different file"
                    :
                    `A PDF is read for you automatically. A CSV is used as-is and needs a month/year header row, e.g. Aug-25. Max ${formatBytes(MAX_UPLOAD_BYTES)}.`}
            </span>
        </label>
        <input ref={inputRef} onChange={handleInputChange} className="hidden"
               id="prayer_times_file" type="file" accept=".pdf,.csv,application/pdf,text/csv" name="prayer_times_file"/>

        <Button component="div" size="lg" disabled={file == null || busy} onClick={onAnalyse}
                startDecorator={isPdf ? <IoSparkles/> : null}
                className="!bg-accent-100 hover:!bg-accent-200 !text-white disabled:!opacity-50">
            {isPdf ? "Read Timetable" : "Read File"}
        </Button>
        <p className="text-xs text-text-200 opacity-70">
            Nothing is saved until you&apos;ve checked the times at the end.
        </p>
    </div>
}

/**
 * Shown when the month is already populated: says so plainly and offers the
 * comparison or a way out. Nothing is written from here.
 */
function ConflictStep(props: {
    monthLabel: string,
    existingDays: number,
    incomingDays: number,
    busy: boolean,
    onCompare: () => void,
    onCancel: () => void
})
{
    return <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{props.monthLabel} already exists</h3>
        <p className="text-sm p-3 rounded-md bg-amber-500/15 border border-amber-500/40 text-text-100">
            There {props.existingDays == 1 ? "is" : "are"} already <span className="font-semibold">{props.existingDays} {props.existingDays == 1 ? "day" : "days"}</span> saved
            for {props.monthLabel}, and the file you uploaded has <span className="font-semibold">{props.incomingDays}</span>.
        </p>
        <p className="text-sm text-text-200">
            You can compare the two versions side by side and choose which to keep for each
            day. Nothing is changed until you confirm.
        </p>
        <div className="flex flex-row flex-wrap gap-2 justify-end">
            <Button component="div" variant="plain" color="neutral" disabled={props.busy} onClick={props.onCancel}>
                Cancel
            </Button>
            <Button component="div" size="lg" disabled={props.busy} onClick={props.onCompare}
                    className="!bg-accent-100 hover:!bg-accent-200 !text-white">
                Compare versions
            </Button>
        </div>
    </div>
}

function ReviewStep(props: {
    timetable: ParsedTimetable,
    busy: boolean,
    onConfirm: () => void,
    onStartOver: () => void,
    onEdited: (timetable: ParsedTimetable) => void
})
{
    const {timetable} = props;
    const [editing, setEditing] = useState(false);
    const incomplete = timetable.prayers.filter(hasMissingTime).length;

    const edit = (date: string, field: string, value: string) =>
        props.onEdited(withEditedTime(timetable, date, field, value));

    const exportCsv = () =>
    {
        // Same shape the CSV importer reads, so an exported file can be edited
        // in a spreadsheet and uploaded again.
        const url = URL.createObjectURL(new Blob([toCsv(timetable)], {type: "text/csv;charset=utf-8"}));
        const link = document.createElement("a");
        link.href = url;
        link.download = csvFilename(timetable);
        link.click();
        // Revoked on a later tick: revoking immediately after click() can pull
        // the blob away before the browser has finished reading it.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Timetable exported");
    };

    return <div className="flex flex-col gap-3">
        <div className="flex flex-row flex-wrap gap-2 justify-between items-baseline">
            <h3 className="text-lg font-semibold">{timetable.monthLabel}</h3>
            <span className="text-sm text-text-200">{timetable.prayers.length} days</span>
        </div>

        <p className="text-sm text-text-200">
            {editing ?
                "Type over any time that was read wrongly. Changes are kept until you save."
                :
                "Check these against the original before saving — especially the iqama times."}
        </p>
        {incomplete > 0 &&
            <p className="text-sm p-2 rounded-md bg-amber-500/15 border border-amber-500/40 text-text-100">
                {incomplete} {incomplete == 1 ? "day is" : "days are"} missing at least one time.
            </p>}

        <div className="flex flex-row flex-wrap gap-2">
            <Button component="div" size="sm" variant={editing ? "solid" : "outlined"} color="neutral"
                    startDecorator={<IoPencilOutline/>} disabled={props.busy}
                    onClick={() => setEditing(!editing)}
                    className={editing ? "!bg-accent-100 !text-white" : "!border-bg-300 !text-text-100 hover:!bg-bg-200"}>
                {editing ? "Done editing" : "Edit"}
            </Button>
            <Button component="div" size="sm" variant="outlined" color="neutral"
                    startDecorator={<IoDownloadOutline/>} disabled={props.busy} onClick={exportCsv}
                    className="!border-bg-300 !text-text-100 hover:!bg-bg-200">
                Export CSV
            </Button>
        </div>

        <div className="max-h-[45vh] overflow-auto border border-bg-300 rounded-md">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-bg-200 text-text-100">
                    <tr>
                        <th className="p-2 font-semibold">Day</th>
                        <th className="p-2 font-semibold">Fajr</th>
                        <th className="p-2 font-semibold">Sunrise</th>
                        <th className="p-2 font-semibold">Dhuhr</th>
                        <th className="p-2 font-semibold">Asr</th>
                        <th className="p-2 font-semibold">Maghrib</th>
                        <th className="p-2 font-semibold">Isha</th>
                    </tr>
                </thead>
                <tbody>
                    {timetable.prayers.map((prayer) =>
                        <tr key={prayer.date} className="border-t border-bg-300">
                            <td className="p-2 font-semibold">{new Date(prayer.date).getUTCDate()}</td>
                            <Cell prayer={prayer} adhanField="fajr_adhan" iqamaField="fajr_iqama" editing={editing} onEdit={edit}/>
                            <Cell prayer={prayer} adhanField="sunrise" editing={editing} onEdit={edit}/>
                            <Cell prayer={prayer} adhanField="dhuhr_adhan" iqamaField="dhuhr_iqama" editing={editing} onEdit={edit}/>
                            <Cell prayer={prayer} adhanField="asr_adhan" iqamaField="asr_iqama" editing={editing} onEdit={edit}/>
                            <Cell prayer={prayer} adhanField="mughrib_adhan" editing={editing} onEdit={edit}/>
                            <Cell prayer={prayer} adhanField="isha_adhan" iqamaField="isha_iqama" editing={editing} onEdit={edit}/>
                        </tr>)}
                </tbody>
            </table>
        </div>

        <div className="flex flex-row gap-2 justify-end">
            <Button component="div" variant="plain" color="neutral" disabled={props.busy} onClick={props.onStartOver}>
                Start over
            </Button>
            <Button component="div" size="lg" disabled={props.busy} onClick={props.onConfirm}
                    className="!bg-accent-100 hover:!bg-accent-200 !text-white disabled:!opacity-50">
                Save {timetable.prayers.length} days
            </Button>
        </div>
    </div>
}

function Cell(props: {
    prayer: DailyPrayer,
    adhanField: string,
    iqamaField?: string,
    editing: boolean,
    onEdit: (date: string, field: string, value: string) => void
})
{
    const adhan = props.prayer[props.adhanField];
    const iqama = props.iqamaField == null ? undefined : props.prayer[props.iqamaField];

    if(props.editing)
    {
        return <td className="p-1 whitespace-nowrap">
            <div className="flex flex-row gap-1">
                <TimeInput value={adhan} onChange={(v) => props.onEdit(props.prayer.date, props.adhanField, v)}/>
                {props.iqamaField != null &&
                    <TimeInput value={iqama} onChange={(v) => props.onEdit(props.prayer.date, props.iqamaField, v)}/>}
            </div>
        </td>
    }

    return <td className="p-2 whitespace-nowrap">
        <span className={adhan ? "" : "text-red-400"}>{adhan || "—"}</span>
        {props.iqamaField != null &&
            <span className="opacity-60"> ({iqama || "—"})</span>}
    </td>
}

function TimeInput(props: {value: string, onChange: (value: string) => void})
{
    // A plain text input rather than type="time": the stored values follow the
    // printed timetable's 12-hour convention, which a time picker would rewrite.
    return <input
        type="text"
        inputMode="numeric"
        placeholder="--:--"
        value={props.value ?? ""}
        onChange={(e) => props.onChange(e.target.value)}
        className={`w-14 px-1 py-0.5 text-xs text-center rounded border bg-bg-100 text-text-100 focus:outline-none focus:border-accent-100 ${props.value ? "border-bg-300" : "border-red-400"}`}/>
}

function hasMissingTime(prayer) : boolean
{
    return ["fajr_adhan", "fajr_iqama", "sunrise", "dhuhr_adhan", "dhuhr_iqama",
            "asr_adhan", "asr_iqama", "mughrib_adhan", "isha_adhan", "isha_iqama"]
        .some((key) => prayer[key] == null || prayer[key] == "");
}

type ReadResult = { error?: string, timetable?: ParsedTimetable };

async function readTimetable(formData: FormData) : Promise<ReadResult>
{
    let conversion: Awaited<ReturnType<typeof convertTimetablePdf>>;
    try
    {
        conversion = await convertTimetablePdf(formData);
    }
    catch (error)
    {
        return {error: describeError(error, "The timetable could not be converted")};
    }

    if(conversion.error != null)
        return {error: conversion.error};

    const timetable = buildTimetable(conversion.year, conversion.month, conversion.rows);
    if(timetable.prayers.length == 0)
        return {error: "No usable day rows came back from the timetable"};

    return {timetable: timetable};
}

async function readCsv(file: File) : Promise<ReadResult>
{
    let text: string;
    try
    {
        text = await readFileAsText(file);
    }
    catch
    {
        return {error: "Could not read the file"};
    }

    // Tolerate CRLF line endings and stray whitespace: the trailing "\r" was
    // otherwise stored as part of the last column of every row.
    const csvRows = text.split(/\r?\n/).map(row => row.split(',').map(cell => cell.trim()));
    const header = csvRows.shift();

    const monthYear = header == null ? null : parseMonthYearString(header[0]);
    if(monthYear == null)
        return {error: "Invalid file format: the first row must be a month and year, e.g. Aug-25"};

    const rows : TimetableRow[] = [];
    for(const row of csvRows)
    {
        if(row.length < TIMETABLE_COLUMN_COUNT || row[0] == "")
            continue;

        rows.push({
            day: parseInt(row[0]),
            hijri: parseInt(row[1]),
            fajr_adhan: row[2],
            fajr_iqama: row[3],
            sunrise: row[4],
            dhuhr_adhan: row[5],
            dhuhr_iqama: row[6],
            asr_adhan: row[7],
            asr_iqama: row[8],
            mughrib_adhan: row[9],
            isha_adhan: row[10],
            isha_iqama: row[11]
        });
    }

    const timetable = buildTimetable(monthYear.year, monthYear.month, rows);
    if(timetable.prayers.length == 0)
        return {error: `No prayer times found in the file — each row needs ${TIMETABLE_COLUMN_COUNT} columns`};

    return {timetable: timetable};
}

async function uploadPrayerTimes(timetable: ParsedTimetable, onProgress: (text: string) => void) : Promise<boolean>
{
    // Progress is reported through the dialog's own overlay rather than a toast,
    // which would just repeat what the dialog already shows.
    const {prayers, monthLabel} = timetable;

    let added = 0;
    let failureReason: string = null;
    for(let i = 0; i < prayers.length; i += BATCH_SIZE)
    {
        const batch = prayers.slice(i, i + BATCH_SIZE);
        onProgress(`Adding ${monthLabel} — ${added}/${prayers.length} days…`);

        let success: boolean;
        try
        {
            success = await addPrayers(batch);
        }
        catch (error)
        {
            success = false;
            failureReason = describeError(error, null);
        }

        if(!success)
        {
            // Only claim to be undoing something if anything was written.
            if(added > 0)
            {
                onProgress("Upload failed, undoing changes…");
                await rollback(timetable);
            }

            toast.error(failureReason ?? `Failed to add prayer times for ${monthLabel}`);
            return false;
        }
        added += batch.length;
    }

    // Reported after the dialog closes, so this is the only confirmation.
    toast.success(`Added ${added} days of prayer times for ${monthLabel}`);
    return true;
}

/**
 * Removes a partially-uploaded month. Reported rather than thrown: the caller is
 * already handling a failure, and losing that message to a second error would
 * leave the admin with no idea what went wrong.
 */
async function rollback(timetable: ParsedTimetable) : Promise<void>
{
    try
    {
        await removePrayerTimes(monthStart(timetable.year, timetable.month), monthEnd(timetable.year, timetable.month));
    }
    catch (error)
    {
        console.error("Failed to undo a partial timetable upload: " + describeError(error, "unknown error"));
        toast.error(`Some days for ${timetable.monthLabel} may have been left behind — check before re-uploading.`);
    }
}

function readFileAsText(file: File) : Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error("Unreadable file"));
        reader.readAsText(file);
    });
}
