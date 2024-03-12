"use client"
import Countdown from "react-countdown";
import {useEffect, useState} from "react";

export default function RamadanCountdown()
{
    const [inClient, setInClient] = useState(false);

    useEffect(() =>{setInClient(true)}, []);
    const renderCountdown = ({days, hours, minutes, seconds, completed}) =>
    {
        if(completed)
        {
            return <h1>RAMADAN HAS ARRIVED</h1>
        }else
        {
            return <div className="flex flex-row justify-center items-start gap-1 md:gap-3">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-6xl font-bold">{days}</h1>
                    <h2 className="text-md md:text-xl font-bold">DAYS</h2>
                </div>
                <h1 className="text-2xl md:text-6xl font-bold">:</h1>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-6xl font-bold">{hours}</h1>
                    <h2 className="text-md md:text-xl font-bold">HOURS</h2>
                </div>
                <h1 className="text-2xl md:text-6xl font-bold">:</h1>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-6xl font-bold">{minutes}</h1>
                    <h2 className="text-md md:text-xl font-bold">MINUTES</h2>
                </div>
                <h1 className="text-2xl md:text-6xl font-bold">:</h1>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-6xl font-bold">{seconds}</h1>
                    <h2 className="text-md md:text-xl font-bold">SECONDS</h2>
                </div>
            </div>
        }
    }
    return <div className="container mx-auto flex flex-col md:flex-row justify-center gap-10 md:gap-0 md:justify-evenly items-center">
            <div className="flex flex-col justify-center">
                <div className="flex">
                    <h1 className="px-2 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-white background-animate text-4xl md:text-6xl font-black">RAMADAN
                        2024</h1>
                </div>
                <h2 className="ml-auto text-2xl md:text-3xl font-black">COUNTDOWN</h2>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                {inClient? <Countdown date={new Date("04-09-2024")} renderer={renderCountdown}/> : renderCountdown({days: 0, hours: 0, minutes: 0, seconds: 0, completed: false})}
                <h1 className="text-gray-300 font-semibold">Estimate: 09/04/2024</h1>
            </div>
        </div>
}