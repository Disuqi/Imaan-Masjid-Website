"use client"
import LinkButton from "@/app/components/buttons/linkButton";
import { DailyPrayer } from "@/lib/entities/dailyprayer";
import { getDailyPrayers } from "@/lib/prayers";
import {
    apiFormattedHijriDate,
    formatDateWithSuffix,
    formatSupabaseTime,
} from "@/lib/utils/date";
import { SalahToArabic, SalahToEnglish, SalahType, parseSalahTimeToMinutes } from "@/lib/utils/salah";
import { useEffect, useState } from "react";
import LoadingAnimation from "./elements/loading";

export default function DailyTimetable() {
    const [dailyPrayers, setDailyPrayers] = useState<DailyPrayer>(null);
    const [hijriDate, setHijriDate] = useState<string>("");
    const [today, setToday] = useState<Date>(null);
    const [currentMinutes, setCurrentMinutes] = useState(-1);

    useEffect(() => {
        setToday(new Date());

        const updateTime = () => {
            const formatter = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Europe/London",
                hour: "numeric",
                minute: "numeric",
                hour12: false
            });
            const timeParts = formatter.format(new Date()).split(':');
            setCurrentMinutes((parseInt(timeParts[0], 10) % 24) * 60 + parseInt(timeParts[1], 10));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (today == null) return;
        getDailyPrayers(today).then(async (loadedDailyPrayers) => {
            if (loadedDailyPrayers == null)
                return;
            setDailyPrayers(loadedDailyPrayers);
        });
        apiFormattedHijriDate(today).then((result) => setHijriDate(result));
    }, [today]);

    let upcomingSalah: SalahType | null = null;
    if (dailyPrayers && currentMinutes !== -1) {
        for (const salah of Object.values(SalahType)) {
            let referenceTimeStr = salah === SalahType.Mughrib ? dailyPrayers[salah + "_adhan"] : dailyPrayers[salah + "_iqama"];
            if (!referenceTimeStr) {
                referenceTimeStr = dailyPrayers[salah + "_adhan"];
            }

            if (referenceTimeStr) {
                const salahMinutes = parseSalahTimeToMinutes(referenceTimeStr, salah);
                if (salahMinutes >= currentMinutes) {
                    upcomingSalah = salah;
                    break;
                }
            }
        }
        
        if (!upcomingSalah) {
            upcomingSalah = SalahType.Fajr;
        }
    }

    if (!today)
        return null;

    return <div className="container mx-auto w-full h-full flex flex-col justify-center items-end z-10">
            <div className="m-2 md:m-5 shadow-xl rounded-xl overflow-hidden animate-scale-in transition-shadow duration-300 hover:shadow-2xl">
                <div className="rounded-t-md bg-bg-200 py-3 px-4 md:py-6 md:px-8 flex flex-row justify-between gap-5 md:gap-20">
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-3xl font-extrabold text-accent-200">{formatDateWithSuffix(today)}</h1>
                        {hijriDate && <h4 className="text-md font-light md:text-xl">{hijriDate}</h4>}
                    </div>
                    <div className="flex justify-center items-center md:w-auto w-[53%]">
                        <LinkButton href="/timetable">
                            <h1 className="text-nowrap whitespace-nowrap text-center text-sm md:text-lg">Full Timetable</h1>
                        </LinkButton>
                    </div>
                </div>
                <div className="rounded-b-md bg-bg-100 py-4 md:py-8">
                    {
                        dailyPrayers ?
                            <table className="text-lg md:text-2xl w-full">
                                <thead className="text-accent-200">
                                    <tr role="rowheader">
                                        <th className="w-[15%] pl-3 md:pl-8 text-end font-thin" role="columnheader">صلاة</th>
                                        <th className="w-[15%] pl-2 md:pl-5 text-start font-bold" role="columnheader">Salah</th>
                                        <th className="w-[100%] pr-2 md:pr-5 text-end font-bold" role="columnheader">Adhan</th>
                                        <th className="w-[100%] pr-3 md:pr-8 text-start font-bold" role="columnheader">Iqamah</th>
                                    </tr>
                                </thead>
                                <tbody className="text-md font-light md:text-xl text-text-200">
                                    {
                                        Object.values(SalahType).map((salah) => {
                                            const isUpcoming = salah === upcomingSalah;
                                            return <tr key={salah} className={`hover:bg-primary-100 transition duration-150 ease-in-out ${isUpcoming ? 'bg-primary-100/30 border-l-4 border-accent-200 font-semibold' : ''}`}>
                                                <td className="py-2 pl-3 md:pl-8 text-end">{SalahToArabic(salah)}</td>
                                                <td className="py-2 pl-2 md:pl-5 text-start">{SalahToEnglish(salah)}</td>
                                                <td className="py-2 pr-2 md:pr-5 text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                <td className="py-2 pr-3 md:pr-8 text-start">{salah == SalahType.Mughrib ? formatSupabaseTime(dailyPrayers[salah + "_adhan"]) : formatSupabaseTime(dailyPrayers[salah + "_iqama"])}</td>
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
        </div>;
}
