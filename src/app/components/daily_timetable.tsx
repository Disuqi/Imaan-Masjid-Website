"use client"
import LinkButton from "@/app/components/buttons/linkButton";
import { DailyPrayer } from "@/lib/entities/dailyprayer";
import { getDailyPrayers } from "@/lib/prayers";
import {
    apiFormattedHijriDate,
    formatDateWithSuffix,
    formatSupabaseTime,
} from "@/lib/utils/date";
import { SalahToArabic, SalahToEnglish, SalahType } from "@/lib/utils/salah";
import { useEffect, useState } from "react";
import LoadingAnimation from "./elements/loading";

export default function DailyTimetable() {
    const [dailyPrayers, setDailyPrayers] = useState<DailyPrayer>(null);
    const [hijriDate, setHijriDate] = useState<string>("");
    const [today, setToday] = useState<Date>(null);

    useEffect(() => {
        setToday(new Date());
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

    if (!today)
        return;

    return <div className="container mx-auto w-full h-full flex flex-col justify-center items-end z-10">
            <div className="m-5">
                <div className="rounded-t-md bg-bg-200 py-6 px-8 flex flex-row justify-between gap-5 md:gap-20">
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
                <div className="rounded-b-md bg-bg-100 py-8">
                    {
                        dailyPrayers ?
                            <table className="text-lg md:text-2xl">
                                <thead className="text-accent-200">
                                    <tr role="rowheader">
                                        <th className="w-[15%] pl-8 text-end font-thin" role="columnheader">صلاة</th>
                                        <th className="w-[15%] pl-5 text-start font-bold" role="columnheader">Salah</th>
                                        <th className="w-[100%] pr-5 text-end font-bold" role="columnheader">Adhan</th>
                                        <th className="w-[100%] pr-8 text-end font-bold" role="columnheader">Iqamah</th>
                                    </tr>
                                </thead>
                                <tbody className="text-md font-light md:text-xl text-text-200">
                                    {
                                        Object.values(SalahType).map((salah) => {
                                            return <tr key={salah} className="hover:bg-primary-100 transition duration-150 ease-in-out">
                                                <td className="pl-8 text-end">{SalahToArabic(salah)}</td>
                                                <td className="pl-5 text-start">{SalahToEnglish(salah)}</td>
                                                <td className="pr-5 text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                <td className="pr-8 text-end">{salah == SalahType.Mughrib ? formatSupabaseTime(dailyPrayers[salah + "_adhan"]) : formatSupabaseTime(dailyPrayers[salah + "_iqama"])}</td>
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
