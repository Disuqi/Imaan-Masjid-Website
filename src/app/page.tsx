import DailyTimetable from "@/app/components/daily_timetable";
import About from "@/app/components/about";
import React from "react";

export default function Page() {
  return (
    <main className="snap-proximity">
        <DailyTimetable/>
        <About/>
    </main>
  )
}
