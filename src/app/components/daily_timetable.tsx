"use client"
import LinkButton from "@/app/components/buttons/linkButton";
import { DailyPrayer } from "@/lib/entities/dailyprayer";
import { getDailyPrayers } from "@/lib/prayers";
import {
    apiFormattedHijriDate,
    formatDateWithSuffix,
    formatSupabaseTime,
    getUkTime
} from "@/lib/utils/date";
import {SalahToArabic, SalahToEnglish, SalahType} from "@/lib/utils/salah";
import {useEffect, useState} from "react";
import LoadingAnimation from "./elements/loading";

export default function DailyTimetable()
{
    const [dailyPrayers, setDailyPrayers] = useState<DailyPrayer>(null);
    const [hijriDate, setHijriDate] = useState<string>("");
    const today = new Date();

    useEffect(() =>
    {
        getDailyPrayers(today).then(async (loadedDailyPrayers) =>
        {
            if(loadedDailyPrayers == null)
                return;
            setDailyPrayers(loadedDailyPrayers);
        });
        apiFormattedHijriDate(today).then((result) => setHijriDate(result));
    }, []);

    return <div className="h-[60vh] bg-[url('/salah%20(4).jpg')] bg-cover">
            <div className="container mx-auto w-full h-full flex flex-col justify-center items-end">
                <div className="m-5">
                    <div className="rounded-t-md bg-bg-200 p-6 flex flex-row justify-between gap-5 md:gap-20">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-3xl font-bold text-accent-200" suppressHydrationWarning>{formatDateWithSuffix(today)}</h1>
                            {hijriDate && <h4 className="text-md font-light md:text-xl">{hijriDate}</h4>}
                        </div>
                        <div className="flex justify-center items-center md:w-auto w-[53%]">
                            <LinkButton href="/timetable">
                                <h1 className="text-nowrap whitespace-nowrap text-center text-sm md:text-lg">Full Timetable</h1>
                            </LinkButton>
                        </div>
                    </div>
                    <div className="rounded-b-md bg-bg-100 py-2">
                        {
                            dailyPrayers ?
                                <table className="text-lg md:text-2xl">
                                    <thead className="text-accent-200">
                                        <tr role="rowheader">
                                            <th className="w-[15%] pl-4 text-start font-semibold" role="columnheader">صلاة
                                            </th>
                                            <th className="w-[15%] text-start font-semibold" role="columnheader">Salah</th>
                                            <th className="w-[100%] px-4 text-end font-semibold" role="columnheader">Adhan
                                            </th>
                                            <th className="w-[100%] pr-4 text-end font-semibold"
                                                role="columnheader">Iqamah
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-md md:text-xl text-text-200">
                                    {
                                        Object.values(SalahType).map((salah) =>
                                        {
                                            return <tr key={salah}>
                                                <td className="pl-4 text-start">{SalahToArabic(salah)}</td>
                                                <td className="text-start">{SalahToEnglish(salah)}</td>
                                                <td className="px-4 text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                {salah == SalahType.Mughrib ?
                                                    <td className="pr-4 text-end">{formatSupabaseTime(dailyPrayers[salah + "_adhan"])}</td>
                                                    :
                                                    <td className="pr-4 text-end">{formatSupabaseTime(dailyPrayers[salah + "_iqama"])}</td>
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
    </div>;
}
