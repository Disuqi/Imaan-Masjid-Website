"use client"
import {
    apiHijriMonth,
    formatSupabaseTime,
    getMonth
} from "@/lib/utils/date";
import {SalahToEnglish, SalahType} from "@/lib/utils/salah";
import {Sheet, Table} from "@mui/joy";
import {DefaultMessage} from "@/app/components/defaultMessage";
import {useEffect, useState} from "react";
import LoadingAnimation from "@/app/components/elements/loading";
import { getPrayers } from "@/lib/prayers";
import { DailyPrayer } from "@/lib/entities/dailyprayer";

export default function Page()
{
    const [loading, setLoading] = useState(true);
    const [prayers, setPrayers] = useState<DailyPrayer[]>([]);
    const [firstHijriMonth, setFirstHijriMonth] = useState<string>(null);
    const [lastHijriMonth, setLastHijriMonth] = useState<string>(null);
    const today = new Date();

    useEffect(() =>
    {
        setLoading(true);
        const firstDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
        const lastDate = new Date(firstDate);

        lastDate.setMonth(lastDate.getMonth() + 1);
        lastDate.setDate(lastDate.getDate() - 1);
        console.log(lastDate.toISOString());

        getPrayers(firstDate, lastDate).then((result) =>
        {    
            setPrayers(result);
            setLoading(false);
        });
        apiHijriMonth(firstDate).then((result) => setFirstHijriMonth(result));
        apiHijriMonth(lastDate).then((result) => setLastHijriMonth(result));
    }, []);

    return <div className="mx-auto container m-5 max-w-vw relative">
        <LoadingAnimation state={loading}/>
        {
            prayers.length > 0 ?
                <>
                    <div className="flex flex-col justify-center items-center md:items-start">

                        <h1 className="text-3xl font-bold">{getMonth(today)} Timetable</h1>
                        {firstHijriMonth && lastHijriMonth &&
                            <h1 className="text-3xl font-bold text-gray-300">{firstHijriMonth}/{lastHijriMonth}</h1>}
                    </div>
                    <div className="my-5 overflow-auto">
                        <Sheet className="min-w-[1000px]">
                            <Table
                                borderAxis="bothBetween"
                                color="neutral"
                                size="md"
                                variant="soft"
                                hoverRow>
                                <thead>
                                <tr>
                                    <th colSpan={3}>Date</th>
                                    <th colSpan={3}>{SalahToEnglish(SalahType.Fajr)}</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Dhuhr)}</th>

                                    <th colSpan={2}>{SalahToEnglish(SalahType.Asr)}</th>
                                    <th colSpan={1}>{SalahToEnglish(SalahType.Mughrib)}</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Isha)}</th>
                                </tr>
                                <tr>
                                    <th>Gregorian</th>
                                    <th>Hijri</th>
                                    <th>Day</th>
                                    <th>Adhan</th>
                                    <th>Iqama</th>
                                    <th>Sunrise</th>
                                    <th>Adhan</th>
                                    <th>Iqama</th>
                                    <th>Adhan</th>
                                    <th>Iqama</th>
                                    <th>Adhan</th>
                                    <th>Adhan</th>
                                    <th>Iqama</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    prayers.map((prayer, i) => {
                                        const date = new Date(prayer.date);
                                        return <tr key={"prayer_time_" + i}>
                                                <td>{date.getDate()}</td>
                                                <td>{prayer.hijri}</td>
                                                <td>{date.toLocaleDateString('en-US', {weekday: 'short'})}</td>
                                                <td>{formatSupabaseTime(prayer.fajr_adhan)}</td>
                                                <td>{formatSupabaseTime(prayer.fajr_iqama)}</td>
                                                <td>{formatSupabaseTime(prayer.sunrise)}</td>
                                                <td>{formatSupabaseTime(prayer.dhuhr_adhan)}</td>
                                                <td>{formatSupabaseTime(prayer.dhuhr_iqama)}</td>
                                                <td>{formatSupabaseTime(prayer.asr_adhan)}</td>
                                                <td>{formatSupabaseTime(prayer.asr_iqama)}</td>
                                                <td>{formatSupabaseTime(prayer.mughrib_adhan)}</td>
                                                <td>{formatSupabaseTime(prayer.isha_adhan)}</td>
                                                <td>{formatSupabaseTime(prayer.isha_iqama)}</td>
                                            </tr>
                                    })
                                }
                                </tbody>
                            </Table>
                        </Sheet>
                    </div>
                </>
                :
                <DefaultMessage message="Timetable for this month has not been uploaded"/>
        }
    </div>;
}