"use client"
import {Button} from "@mui/joy";
import {useState} from "react";
import toast from "react-hot-toast";
import {DailyPrayer} from "@/lib/entities/dailyprayer";
import {addPrayer, removePrayerTimes} from "@/lib/prayers";

export default function AddPrayerTimesForm(props: {onStart: () => void, onComplete: () => void})
{
    const [prayersFile, setPrayersFile] = useState(null);

    const handleInputChange = (e) =>
    {
        const file = e.target.files[0];
        if(file)
        {
            setPrayersFile(file);
        }
    }

    const onSubmit = async () =>
    {
        props.onStart();
        await addDailyPrayer(prayersFile);
        props.onComplete();
    }

    return <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col gap-2 justify-center items-start">
            <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="prayer_times_file">Upload CSV file</label>
            <input onChange={handleInputChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" id="prayer_times_file" type="file" accept="text/csv" name="prayer_times_file"/>
            <div className="text-center w-full mt-2">
                <Button component="div" onClick={onSubmit}>Submit</Button>
            </div>
        </div>
    </div>
}

async function addDailyPrayer(prayersFile) : Promise<void>
{
    const file = prayersFile as File;
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
        const successfullyAdded : DailyPrayer[] = [];
        for (const row of prayerTimes)
        {
            if(row.length < 12 || row[0] == "")
                continue;
            const day = row[0];
            const hijri = row[1];
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

            const date = new Date();
            date.setTime(0);
            date.setFullYear(year);
            date.setMonth(month);
            date.setDate(parseInt(day));
            console.log("Date: " + date);
            console.log("Date to ISO: " + date.toISOString());
            console.log("Asr adhan: " + asr_adhan);
            console.log("end of row");


            const prayer : DailyPrayer = {
                date: date.toISOString(),
                hijri: parseInt(hijri), 
                fajr_adhan: fajr_adhan, 
                fajr_iqama: fajr_iqama,
                sunrise: sunrise, 
                dhuhr_adhan: dhuhr_adhan, 
                dhuhr_iqama: dhuhr_iqama, 
                asr_adhan: asr_adhan, 
                asr_iqama: asr_iqama, 
                mughrib_adhan: mughrib_adhan, 
                isha_adhan: isha_adhan, 
                isha_iqama: isha_iqama
            };
            const result = await addPrayer(prayer);
            if(!result)
            {
                await removePrayerTimes(new Date(successfullyAdded[0].date), new Date(successfullyAdded[successfullyAdded.length - 1].date));
                toast.error("Failed to add prayer times");
                return;
            }else
            {
                successfullyAdded.push(prayer);
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