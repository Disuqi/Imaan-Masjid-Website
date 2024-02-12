"use client"
import {Sheet, Table} from "@mui/joy";
import {getHijriMonth, getMonth} from "@/app/components/utils/date";
import {SalahToEnglish, SalahType} from "@/app/components/utils/salah";
import {useEffect, useState} from "react";
import {ScreenSize} from "@/app/constants";
import {widthToScreenSize} from "@/app/components/utils/screen";

export default function MonthlyTimetable()
{
    const timeTableData = "1,20,THU,06:16,06:45,07:56,12:28,12:45,02:28,02:45,04:53,06:37,07:00\n" +
        "2,21,FRI,06:14,06:45,07:54,12:28,12:25,02:29,03:00,04:55,06:38,07:15\n" +
        "3,22,SAT,06:13,06:45,07:53,12:28,12:45,02:31,03:00,04:58,06:39,07:15\n" +
        "4,23,SUN,06:11,06:45,07:51,12:29,12:45,02:32,03:00,05:00,06:41,07:15\n" +
        "5,24,MON,06:09,06:45,07:49,12:29,12:45,02:34,03:00,05:03,06:42,07:15\n" +
        "6,25,TUE,06:07,06:45,07:47,12:29,12:45,02:35,03:00,05:06,06:44,07:15\n" +
        "7,26,WED,06:05,06:45,07:45,12:29,12:45,02:37,03:00,05:08,06:45,07:15\n" +
        "8,27,THU,06:04,06:45,07:44,12:29,12:45,02:39,03:00,05:10,06:47,07:15\n" +
        "9,28,FRI,06:02,06:30,07:42,12:29,12:25,02:40,03:15,05:12,06:48,07:15\n" +
        "10,29,SAT,06:00,06:30,07:40,12:29,12:45,02:42,03:15,05:14,06:50,07:15\n" +
        "11,1,SUN,05:58,06:30,07:38,12:29,12:45,02:43,03:15,05:16,06:52,07:15\n" +
        "12,2,MON,05:56,06:30,07:36,12:29,12:45,02:45,03:15,05:18,06:54,07:15\n" +
        "13,3,TUE,05:54,06:30,07:34,12:29,12:45,02:46,03:15,05:20,06:55,07:15\n" +
        "14,4,WED,05:52,06:30,07:32,12:29,12:45,02:48,03:15,05:22,06:57,07:15\n" +
        "15,5,THU,05:50,06:30,07:30,12:29,12:45,02:49,03:15,05:24,06:59,07:15\n" +
        "16,6,FRI,05:48,06:15,07:28,12:29,12:25,02:51,03:45,05:26,07:01,07:30\n" +
        "17,7,SAT,05:46,06:15,07:26,12:29,12:45,02:52,03:45,05:28,07:02,07:30\n" +
        "18,8,SUN,05:43,06:15,07:23,12:29,12:45,02:54,03:45,05:30,07:04,07:30\n" +
        "19,9,MON,05:41,06:15,07:21,12:29,12:45,02:55,03:45,05:32,07:06,07:30\n" +
        "20,10,TUE,05:39,06:15,07:19,12:28,12:45,02:57,03:45,05:34,07:08,07:30\n" +
        "21,11,WED,05:37,06:15,07:17,12:28,12:45,02:58,03:45,05:36,07:09,07:30\n" +
        "22,12,THU,05:35,06:15,07:15,12:28,12:45,03:00,03:45,05:38,07:11,07:30\n" +
        "23,13,FRI,05:33,06:00,07:13,12:28,12:25,03:01,03:45,05:40,07:13,07:45\n" +
        "24,14,SAT,05:30,06:00,07:10,12:28,12:45,03:04,03:45,05:42,07:15,07:45\n" +
        "25,15,SUN,05:28,06:00,07:08,12:28,12:45,03:05,03:45,05:44,07:16,07:45\n" +
        "26,16,MON,05:26,06:00,07:06,12:28,12:45,03:07,03:45,05:45,07:17,07:45\n" +
        "27,17,TUE,05:24,06:00,07:04,12:27,12:45,03:08,03:45,05:47,07:19,07:45\n" +
        "28,18,WED,05:21,06:00,07:01,12:27,12:45,03:09,03:45,05:49,07:20,07:45\n" +
        "29,19,THU,05:19,06:00,06:59,12:27,12:45,03:10,03:45,05:51,07:21,07:45\n";
    const rows = timeTableData.split('\n').map(row => row.split(','));

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const hijriFirstMonth = getHijriMonth(firstDay);
    const hijriLastMonth = getHijriMonth(lastDay);

    const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize>(null);

    useEffect(() => {
        const updateScreenSize = () =>
        {
            setCurrentScreenSize(widthToScreenSize(window.innerWidth));
        }
        window.addEventListener('resize', updateScreenSize);
        updateScreenSize();
        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    return <div className="mx-auto container m-5">
            <div className="flex flex-col justify-center items-center md:items-start">
                <h1 className="text-3xl font-bold">{getMonth(today)} Timetable</h1>
                <h1 className="text-3xl font-bold text-gray-300">{hijriFirstMonth}/{hijriLastMonth}</h1>
            </div>
            <div className="my-5">
                {
                    currentScreenSize > ScreenSize.md ?
                        <Sheet>
                            <Table
                                borderAxis="bothBetween"
                                color="neutral"
                                size="lg"
                                variant="soft">
                                <thead className="sticky top-[8vh] left-0">
                                <tr>
                                    <th colSpan={3}>Date</th>
                                    <th colSpan={3}>{SalahToEnglish(SalahType.Fajr)}</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Dhuhur)}</th>

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
                                {rows.map((row) => {
                                    // eslint-disable-next-line react/jsx-key
                                    return <tr className="hover:bg-blue-100 transition duration-100 ease-in-out">
                                        {row.map((cell) => {
                                            // eslint-disable-next-line react/jsx-key
                                            return <td>{cell}</td>;
                                        })}
                                    </tr>;
                                })}
                                </tbody>
                            </Table>
                        </Sheet>
                        :
                        <Sheet>
                            <Table
                                borderAxis="bothBetween"
                                color="neutral"
                                size="sm"
                                variant="soft">
                                <thead className="sticky top-[8vh] left-0">
                                <tr>
                                    <th colSpan={2}>Date</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Fajr)}</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Dhuhur)}</th>

                                    <th colSpan={2}>{SalahToEnglish(SalahType.Asr)}</th>
                                    <th colSpan={1}>{SalahToEnglish(SalahType.Mughrib)}</th>
                                    <th colSpan={2}>{SalahToEnglish(SalahType.Isha)}</th>
                                </tr>
                                <tr>
                                    <th>Number</th>
                                    <th>Day</th>
                                    <th>Adhan</th>
                                    <th>Iqama</th>
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
                                {rows.map((row) => {
                                    // eslint-disable-next-line react/jsx-key
                                    return <tr className="hover:bg-blue-100 transition duration-100 ease-in-out">
                                        {row.map((cell) => {
                                            if (cell === row[1] || cell === row[5])
                                                return;
                                            // eslint-disable-next-line react/jsx-key
                                            return <td>{cell}</td>;
                                        })}
                                    </tr>;
                                })}
                                </tbody>
                            </Table>
                        </Sheet>
                }

            </div>
        </div>;
}