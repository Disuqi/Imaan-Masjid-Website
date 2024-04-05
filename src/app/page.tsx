import DailyTimetable from "@/app/components/daily_timetable";
import About from "@/app/components/about";
import React from "react";
import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import RamadanCountdown from "@/app/components/ramadan_countdown";

export default function Page() {
  return (
      <main className="flex flex-col">
          <div className="h-[100dvh] flex flex-col">
              <div className="col-span-2 h-full">
                  <DailyTimetable/>
              </div>
              <div className="col-span-1 h-full flex justify-center items-center">
                  <LinkButton href="#ramadan2024" variant="plain" size="lg" endDecorator={<FaArrowDownLong/>}>
                      Ramadan 2024
                  </LinkButton>
              </div>
          </div>
          <div id="ramadan2024" className="h-[100dvh] flex flex-col justify-evenly">
              <RamadanCountdown/>
              <div className="flex justify-center items-center">
                  <LinkButton href="#about" variant="plain" size="lg" endDecorator={<FaArrowDownLong/>}>
                      About Imaan Masjid
                  </LinkButton>
              </div>
          </div>
          <section id="about" className="h-[100dvh] flex justify-center items-center">
              <About/>
          </section>
      </main>
  )
}
