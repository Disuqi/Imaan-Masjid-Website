"use client"
import {Sheet, Table} from "@mui/joy";
import {dateToSupabaseDate, formatSupabaseTime, getHijriMonth, getMonth} from "@/app/components/utils/date";
import {DailyPrayers, SalahToEnglish, SalahType} from "@/app/components/utils/salah";
import supabase from "@/lib/supabase";
import {DefaultMessage} from "@/app/components/defaultMessage";
import {useState} from "react";
import LoadingAnimation from "@/app/components/utils/loading";

export default function MonthlyTimetable()
{
    const [loading, setLoading] = useState(true);
    const [prayers, setPrayers] = useState<DailyPrayers[]>([]);
    const firstDate = new Date();
    firstDate.setDate(1);
    const lastDate = new Date(firstDate);
    lastDate.setMonth(lastDate.getMonth() + 1);
    lastDate.setDate(lastDate.getDate() - 1);

    const hijriFirstMonth = getHijriMonth(firstDate);
    const hijriLastMonth = getHijriMonth(lastDate);

    supabase.from("DailyPrayers")
        .select("*")
        .gte("date", dateToSupabaseDate(firstDate))
        .lte("date", dateToSupabaseDate(lastDate))
        .returns<DailyPrayers[]>().then((result) =>
    {
        if(result.error == null)
        {
            setPrayers(result.data);
        }
        setLoading(false);
    });

    return <div className="mx-auto container m-5 max-w-vw">
            <LoadingAnimation state={loading}/>
            {
                prayers.length > 0 ?
                    <>
                        <div className="flex flex-col justify-center items-center md:items-start">
                            <h1 className="text-3xl font-bold">{getMonth(firstDate)} Timetable</h1>
                            <h1 className="text-3xl font-bold text-gray-300">{hijriFirstMonth}/{hijriLastMonth}</h1>
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
                                        prayers.map((prayer) => {
                                            const date = new Date(prayer.date);
                                            return <>
                                                <tr>
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
                                            </>
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