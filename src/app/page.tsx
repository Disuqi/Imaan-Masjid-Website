import DailyTimetable from "@/app/components/daily_timetable";
import About from "@/app/components/about";
import React from "react";
import supabase from "@/lib/supabase";
import {dateToSupabaseDate} from "@/app/components/utils/date";
import {DailyPrayers} from "@/app/components/utils/salah";

export default function Page() {
  return (
    <main className="snap-proximity">
        <DailyTimetable/>
        <About/>
    </main>
  )
}
