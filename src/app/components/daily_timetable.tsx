"use client"
import Link from "next/link";
import {Button} from "@mui/joy";
import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import {
    dateToSupabaseDate,
    formatDateWithSuffix,
    formatSupabaseTime,
    formatToHijriDate
} from "@/app/components/utils/date";
import {DailyPrayers, SalahToArabic, SalahToEnglish, SalahType} from "@/app/components/utils/salah";
import supabase from "@/lib/supabase";
import {useState} from "react";

export default function DailyTimetable()
{
    const [dailyPrayers, setDailyPrayers] = useState<DailyPrayers>(null);
    const today = new Date();
    supabase.from("DailyPrayers").select("*").eq("date", dateToSupabaseDate(today)).single<DailyPrayers>().then((result) =>
    {
        if(result.error == null)
        {
            setDailyPrayers(result.data);
        }
    });

    return <section className="h-[92vh] flex flex-col justify-between">
        <div className="h-4/6 w-full bg-[url('/salah%20(4).jpg')] bg-cover">
            <div className="container mx-auto w-full h-full flex flex-col justify-center items-end">
                <div className="m-5">
                    <div className="rounded-t-md bg-white p-6 flex flex-row justify-between gap-5 md:gap-20">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-3xl font-bold">{formatDateWithSuffix(today)}</h1>
                            <h4 className="text-md font-light md:text-xl">{formatToHijriDate(today)}</h4>
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
                                    <tr>
                                        <td className="pl-4 font-light text-start">{SalahToArabic(SalahType.Fajr)}</td>
                                        <td className="font-light text-start">{SalahToEnglish(SalahType.Fajr)}</td>
                                        <td className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers.fajr_adhan)}</td>
                                        <td className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers.fajr_iqama)}</td>
                                    </tr>
                                    <tr>
                                        <th className="pl-4 font-light text-start">{SalahToArabic(SalahType.Dhuhr)}</th>
                                        <th className="font-light text-start">{SalahToEnglish(SalahType.Dhuhr)}</th>
                                        <th className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers.dhuhr_adhan)}</th>
                                        <th className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers.dhuhr_iqama)}</th>
                                    </tr>
                                    <tr>
                                        <th className="pl-4 font-light text-start">{SalahToArabic(SalahType.Asr)}</th>
                                        <th className="font-light text-start">{SalahToEnglish(SalahType.Asr)}</th>
                                        <th className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers.asr_adhan)}</th>
                                        <th className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers.asr_iqama)}</th>
                                    </tr>
                                    <tr>
                                        <th className="pl-4 font-light text-start">{SalahToArabic(SalahType.Mughrib)}</th>
                                        <th className="font-light text-start">{SalahToEnglish(SalahType.Mughrib)}</th>
                                        <th className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers.mughrib_adhan)}</th>
                                        <th className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers.mughrib_adhan)}</th>
                                    </tr>
                                    <tr>
                                        <th className="pl-4 font-light text-start">{SalahToArabic(SalahType.Isha)}</th>
                                        <th className="font-light text-start">{SalahToEnglish(SalahType.Isha)}</th>
                                        <th className="font-light px-4 text-end">{formatSupabaseTime(dailyPrayers.isha_adhan)}</th>
                                        <th className="pr-4 font-light text-end">{formatSupabaseTime(dailyPrayers.isha_iqama)}</th>
                                    </tr>
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