import PrayersTimetable from "@/app/components/prayers_timetable";
import About from "@/app/components/about";
import React from "react";

export default function Page() {
  return (
    <main className="snap-proximity">
        <PrayersTimetable/>
        <About/>
    </main>
  )
}
