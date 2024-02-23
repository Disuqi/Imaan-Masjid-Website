"use client"
import Link from "next/link";
import {Button} from "@mui/joy";
import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import {
    apiFormattedHijriDate,
    dateToSupabaseDate,
    formatDateWithSuffix,
    formatSupabaseTime,
    getUkTime
} from "@/app/components/utils/date";
import {DailyPrayers, SalahToArabic, SalahToEnglish, SalahType} from "@/app/components/utils/salah";
import supabase from "@/lib/supabase";
import {useEffect, useState} from "react";

export default function DailyTimetable()
{
    const [dailyPrayers, setDailyPrayers] = useState<DailyPrayers>(null);
    const [hijriDate, setHijriDate] = useState<string>("");
    const [highlightedSalah, setHighlightedSalah] = useState<SalahType>(SalahType.Fajr);

    const today = new Date();

    useEffect(() =>
    {
        supabase.from("DailyPrayers").select().eq("date", dateToSupabaseDate(today)).single<DailyPrayers>().then(async (result) =>
        {

            if(result.error != null || result.data == null)
                return;

            let loadedDailyPrayers = result.data;
            const upcomingSalah = getUpcomingSalah(today, loadedDailyPrayers);

            if(ishaIqamaHasPassed(today, loadedDailyPrayers.isha_iqama))
            {
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const secondResult = await supabase.from("DailyPrayers").select().eq("date", dateToSupabaseDate(tomorrow)).single<DailyPrayers>();
                if(secondResult.error != null || secondResult.data == null)
                    return;
                loadedDailyPrayers = secondResult.data;
            }

            setDailyPrayers(loadedDailyPrayers);
            setHighlightedSalah(upcomingSalah);
        });
        apiFormattedHijriDate(today).then((result) => setHijriDate(result));
    }, []);

    return <section className="h-[92vh] flex flex-col justify-between">
        <div className="h-4/6 w-full bg-[url('/salah%20(4).jpg')] bg-cover">
            <div className="container mx-auto w-full h-full flex flex-col justify-center items-end">
                <div className="m-5">
                    <div className="rounded-t-md bg-white p-6 flex flex-row justify-between gap-5 md:gap-20">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-3xl font-bold">{formatDateWithSuffix(today)}</h1>
                            {hijriDate && <h4 className="text-md font-light md:text-xl">{hijriDate}</h4>}
                        </div>
                        <div className="flex justify-center items-center md:w-auto w-[53%]">
                            <LinkButton href="/timetable">
                                <h1 className="text-nowrap whitespace-nowrap text-center text-sm md:text-lg">Full Timetable</h1>
                            </LinkButton>
                        </div>
                    </div>
                    <div className="rounded-b-md bg-gray-50 py-2">
                        {
                            dailyPrayers ?
                                <table className="text-lg md:text-2xl">
                                    <thead className="text-gray-300">
                                    <tr role="rowheader">
                                        <th className="w-[15%] font-semibold pl-4 text-start" role="columnheader">صلاة
                                        </th>
                                        <th className="w-[15%] font-semibold text-start" role="columnheader">Salah</th>
                                        <th className="w-[100%] font-semibold px-4 text-end" role="columnheader">Adhan
                                        </th>
                                        <th className="w-[100%] font-semibold pr-4 text-end"
                                            role="columnheader">Iqamah
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-md md:text-xl">
                                    {
                                        Object.values(SalahType).map((salah) =>
                                        {
                                            let className = "";
                                            if(salah == highlightedSalah)
                                                className = "bg-blue-100";

                                            return <tr key={salah} className={className}>
                                                <td className="pl-4 font-light text-start">{SalahToArabic(salah)}</td>
                                                <td className="font-light text-start">{SalahToEnglish(salah)}</td>
                                                <td className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                {salah == SalahType.Mughrib ?
                                                    <td className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                    :
                                                    <td className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers[salah + "_iqama"])}</td>
                                                }
                                            </tr>
                                        })
                                    }
                                    </tbody>
                                </table>
                                :
                                <>
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
        <Link href="#about" className="flex justify-center items-center w-full h-2/6">
            <Button variant="plain" size="lg" endDecorator={<FaArrowDownLong/>}>
                About Imaan Masjid
            </Button>
        </Link>
    </section>;
}

function ishaIqamaHasPassed(currentDate: Date, ishaIqama: string) : boolean
{
    let ukTime = getUkTime(currentDate);
    if (ukTime.includes("am"))
        return false;
    ukTime = ukTime.replace("pm", '');

    const time1Date = new Date(`${currentDate.toDateString()} ${ukTime}`);
    const time2Date = new Date(`${currentDate.toDateString()} ${ishaIqama}`);

    return time1Date > time2Date;
}

function getUpcomingSalah(currentDate: Date, dailyPrayers: DailyPrayers) : SalahType
{
    let upcomingSalah = SalahType.Fajr;
    let ukTime = getUkTime(currentDate);

    const ukTimeDate = new Date(`${currentDate.toDateString()} ${ukTime}`);

    const fajrIqamaDate = new Date(`${currentDate.toDateString()} ${dailyPrayers.fajr_iqama} am`);
    if(ukTimeDate > fajrIqamaDate)
        upcomingSalah = SalahType.Dhuhr;

    let duhurAmPm = "";
    if(parseInt(dailyPrayers.dhuhr_iqama.substring(0, 2)) < 12)
    {
        duhurAmPm = "am";
    }
    const dhuhrIqamaDate = new Date(`${currentDate.toDateString()} ${dailyPrayers.dhuhr_iqama} ${duhurAmPm}`);
    if(ukTimeDate > dhuhrIqamaDate)
        upcomingSalah = SalahType.Asr;

    const asrIqamaDate = new Date(`${currentDate.toDateString()} ${dailyPrayers.asr_iqama} pm`);
    if(ukTimeDate > asrIqamaDate)
        upcomingSalah = SalahType.Mughrib;

    const mughribIqamaDate = new Date(`${currentDate.toDateString()} ${dailyPrayers.mughrib_adhan} pm`);
    if(ukTimeDate > mughribIqamaDate)
        upcomingSalah = SalahType.Isha;

    const ishaIqamaDate = new Date(`${currentDate.toDateString()} ${dailyPrayers.isha_iqama} pm`);
    if(ukTimeDate > ishaIqamaDate)
        upcomingSalah = SalahType.Fajr;

    return upcomingSalah;
}
