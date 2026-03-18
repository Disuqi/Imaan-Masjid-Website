"use client"
import About from "@/app/components/about";
import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import dynamic from "next/dynamic";

const DailyTimetable = dynamic(() => import("@/app/components/daily_timetable"), { ssr: false })

export default function Page() {
  return (
      <main className="flex flex-col">
          <div className="h-[100dvh] flex flex-col">
              <div className="min-h-[60%] relative">
                    <DailyTimetable/>
                    <div className="absolute h-full w-full top-0 left-0 -z-10 bg-[url(/pattern.png)] bg-contain dark:invert dark:opacity-80"></div>
              </div>
              <div className="h-full flex justify-center items-center">
                  <LinkButton href="#about" variant="plain" size="lg" endDecorator={<FaArrowDownLong/>} className="bg-bg-100 hover:bg-primary-100 text-text-100 transition duration-150 ease-in-out">
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
