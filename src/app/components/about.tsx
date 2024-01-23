import React from "react";
import Link from "next/link";
import {AspectRatio, Button} from "@mui/joy";

export default function About()
{
    return <section id="about" className="min-h-screen flex justify-center items-center w-full">
        <div className="container mx-auto flex justify-center items-center">
            <div className="bg-blue-200 flex flex-col items-center justify-center xl:flex-row xl:justify-evenly xl:items-end w-full m-10 xl:mx-20 relative rounded-2xl">
                <div className="xl:w-1/2 xl:-translate-y-20 xl:mt-0 mt-[5%] w-[90%]">
                    <AspectRatio sx={{width: "100%", backgroundColor: "rgba(0, 0, 0, 0)", borderRadius: "1rem"}}>
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/6OnyXVlp6Og?si=_zGpYjOiBYLy-0JK"
                                    title="Imaan Masjid Bolton"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen></iframe>
                    </AspectRatio>
                </div>
                <div className="h-auto xl:h-full xl:w-[40%] flex flex-col gap-2 p-10">
                    <h1 className="text-2xl xl:text-4xl font-bold">About Imaan Masjid</h1>
                    <p className="text-lg xl:text-xl">The Imaan Masjid as an organisation runs a Masjid, Madrassah and Community Centre in Bolton – aiming to enrich the local and wider communities with the pure knowledge of the Quran and Sunnah as understood by the companions and righteous predecessors.</p>
                    <div className="my-4">
                        <Link href="/events">
                            <Button variant="solid" size="lg">Events</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>;
}