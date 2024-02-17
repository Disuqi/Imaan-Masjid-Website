"use client"
import {Button} from "@mui/joy";
import {FormEvent} from "react";
import toast from "react-hot-toast";
import {DailyPrayers} from "@/app/components/utils/salah";
import supabase from "@/lib/supabase";
import {dateToSupabaseDate} from "@/app/components/utils/date";

export default function AddPrayerTimesForm(props: {onStart: () => void, onComplete: () => void})
{
    const onSubmit = async (formEvent: FormEvent) =>
    {
        props.onStart();
        formEvent.preventDefault();
        //@ts-ignore
        const formData = new FormData(formEvent.target);
        await addDailyPrayer(formData);
        props.onComplete();
    }

    return <div className="flex flex-col justify-center items-center">
        <form className="flex flex-col gap-2 justify-center items-start" onSubmit={onSubmit}>
            <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="prayer_times_file">Upload CSV file</label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" id="prayer_times_file" type="file" accept="text/csv" name="prayer_times_file"/>
            <div className="text-center w-full mt-2">
                <Button type="submit">Submit</Button>
            </div>
        </form>
    </div>
}

async function addDailyPrayer(formData : FormData) : Promise<void>
{
    const file = formData.get("prayer_times_file") as File;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async (e) =>
    {
        const text = e.target.result as string;
        const prayerTimes = text.split('\n').map(row => row.split(','));
        const monthYear = parseMonthYearString(prayerTimes.shift()[0]);
        if(monthYear == null)
        {
            toast.error("Invalid file format");
            return;
        }
        const month = monthYear.getMonth();
        const year = monthYear.getFullYear();
        for (const row of prayerTimes)
        {
            if(row.length < 12 || row[0] == "")
                continue;
            const day = row[0];
            const hijri = parseInt(row[1]);
            const fajr_adhan = row[2];
            const fajr_iqama = row[3];
            const sunrise = row[4];
            const dhuhr_adhan = row[5];
            const dhuhr_iqama = row[6];
            const asr_adhan = row[7];
            const asr_iqama = row[8];
            const mughrib_adhan = row[9];
            const isha_adhan = row[10];
            const isha_iqama = row[11];

            const date = new Date(year, month, parseInt(day));
            const prayer = new DailyPrayers(dateToSupabaseDate(date), hijri, fajr_adhan, fajr_iqama, sunrise, dhuhr_adhan, dhuhr_iqama, asr_adhan, asr_iqama, mughrib_adhan, isha_adhan, isha_iqama);
            const result = await supabase.from("DailyPrayers").insert(prayer);
            if(result.error)
            {
                toast.error("Failed to add prayer times");
                console.log(result.error);
                return;
            }
        }
        toast.success("Prayer times added");
    }
}

function parseMonthYearString(dateString: string) : Date | null
{
    let [monthStr, yearStr] = dateString.split('-');

    if(yearStr.length == 2)
    {
        yearStr = "20" + yearStr;
    }

    // Map month abbreviation to its number
    const monthMap: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const month = monthMap[monthStr];
    const year = parseInt(yearStr);

    if (month !== undefined && !isNaN(year))
    {
        return new Date(year, month);
    }
    else
    {
        return null;
    }
}