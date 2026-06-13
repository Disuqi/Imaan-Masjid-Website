"use client"
import About from "@/app/components/about";
import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import Reveal from "@/app/components/elements/reveal";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

const DailyTimetable = dynamic(() => import("@/app/components/daily_timetable"), { ssr: false })

export default function Page() {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setBgLoaded(true);
    img.src = "/pattern.png";
    if (img.complete) setBgLoaded(true);
  }, []);

  return (
      <main className="flex flex-col">
          <div className="h-[100vh] flex flex-col">
              <div className="min-h-[60%] relative">
                    <DailyTimetable/>
                    <div className={`absolute h-full w-full top-0 left-0 -z-10 bg-[url(/pattern.png)] bg-contain dark:invert transition-all duration-1000 ease-out ${bgLoaded ? "opacity-100 dark:opacity-80 scale-100" : "opacity-0 scale-105"}`}></div>
              </div>
              <div className="h-full flex justify-center items-center animate-fade-in">
                  <LinkButton href="#about" variant="plain" size="lg" endDecorator={<FaArrowDownLong className="animate-float"/>} className="bg-bg-100 hover:bg-primary-100 text-text-100 transition duration-150 ease-in-out">
                      About Imaan Masjid
                  </LinkButton>
              </div>
          </div>
          <section id="about" className="min-h-[100dvh] flex justify-center items-center py-10">
              <Reveal className="w-full flex justify-center">
                  <About/>
              </Reveal>
          </section>
      </main>
  )
}
