import React from "react";
import Link from "next/link";
import {Button} from "@mui/joy";
import {FaArrowDownLong} from "react-icons/fa6";
import {SalahTime, SalahType} from "./utils/salah";
import LinkButton from "@/app/components/buttons/linkButton";
import {formatDateWithSuffix, formatToHijriDate} from "@/app/components/utils/date";

export default function DailyTimetable()
{
    const prayers =
        [
            new SalahTime(SalahType.Fajr, "7:00", "7:00"),
            new SalahTime(SalahType.Dhuhur, "7:00", "7:00"),
            new SalahTime(SalahType.Asr, "7:00", "7:00"),
            new SalahTime(SalahType.Mughrib, "7:00", "7:00", true),
            new SalahTime(SalahType.Isha, "7:00", "7:00"),
        ];

    const today = new Date();
    return <section className="h-[92vh] flex flex-col justify-between">
        <div className="h-4/6 w-full bg-[url('/salah%20(4).jpg')] bg-cover">
            <div className="container mx-auto w-full h-full flex flex-col justify-center items-end">
                <div className="border border-gray-200 bg-white m-5">
                    <div className="p-6 flex flex-row justify-between gap-5 md:gap-20">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-3xl font-bold">{formatDateWithSuffix(today)}</h1>
                            <h4 className="text-md font-light md:text-xl">{formatToHijriDate(today)}</h4>
                        </div>
                        <div className="flex justify-center items-center md:w-auto w-[53%]">
                            <LinkButton href="/timetable">
                                <h1 className="text-sm md:text-lg">Full Timetable</h1>
                            </LinkButton>
                        </div>
                    </div>
                    <div className="bg-gray-50 py-2">
                        <table className="text-lg md:text-2xl">
                            <thead className="text-gray-300">
                                <tr role="rowheader">
                                    <th className="w-[15%] font-semibold pl-4 text-start" role="columnheader">صلاة</th>
                                    <th className="w-[15%] font-semibold text-start" role="columnheader">Salah</th>
                                    <th className="w-[100%] font-semibold px-4 text-end" role="columnheader">Adhan</th>
                                    <th className="w-[100%] font-semibold pr-4 text-end" role="columnheader">Iqamah</th>
                                </tr>
                            </thead>
                            <tbody className="text-md md:text-xl">
                            {prayers.map((prayer) =>
                                // eslint-disable-next-line react/jsx-key
                                <tr className={prayer.comingUp? "bg-blue-100 px-4" : "px-4"}>
                                    <th className="pl-4 font-light text-start">{prayer.getSalahArabic()}</th>
                                    <th className="font-light text-start">{prayer.getSalahEnglish()}</th>
                                    <th className="font-light px-4 text-end">{prayer.adhan}</th>
                                    <th className="pr-4 font-light text-end">{prayer.iqamah}</th>
                                </tr>)}
                            </tbody>
                        </table>
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