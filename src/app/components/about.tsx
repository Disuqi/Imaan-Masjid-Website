import React from "react";
import {AspectRatio} from "@mui/joy";
import LinkButton from "@/app/components/buttons/linkButton";
import ImaanMasjidLogo from "./logo";

export default function About()
{
    return <div className="container mx-auto flex justify-center items-center mb-20">
            <div className="bg-gradient-to-r from-primary-200 to-primary-100 flex flex-col items-center justify-center xl:flex-row xl:justify-evenly xl:items-end w-full m-10 xl:mx-20 relative rounded-lg">
                <div className="xl:w-1/2 xl:-translate-y-20 xl:mt-0 mt-[5%] w-[90%]">
                    <AspectRatio sx={{width: "100%", backgroundColor: "rgba(0, 0, 0, 0)", borderRadius: "0.5rem"}}>
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/6OnyXVlp6Og?si=_zGpYjOiBYLy-0JK"
                                    title="Imaan Masjid Bolton"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen></iframe>
                    </AspectRatio>
                </div>
                <div className="h-auto xl:h-full xl:w-[40%] flex flex-col gap-4 p-10 text-center">
                    <ImaanMasjidLogo/>
                    <p className="text-lg xl:text-xl text-text-200">The Imaan Masjid as an organisation runs a Masjid, Madrassah and Community Centre in Bolton – aiming to enrich the local and wider communities with the pure knowledge of the Quran and Sunnah as understood by the companions and righteous predecessors.</p>
                    <p className="font-semibold">Open from Dhuhur - Isha (and around Fajr time).</p>
                </div>
            </div>
        </div>
}