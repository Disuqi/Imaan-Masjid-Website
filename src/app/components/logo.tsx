"use client"
import Link from "next/link";
import {ScreenSize} from "@/app/constants";
import {useEffect, useState} from "react";
import {Button, Drawer} from "@mui/joy";
import {LuMenu} from "react-icons/lu";
import {widthToScreenSize} from "@/lib/utils/screen";
import { getUser } from "@/lib/auth";

export default function ImaanMasjidLogo()
{
    return <>
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-logo font-black">IMAAN MASJID</h1>
            <p className="text-xs font-sublogo font-thin">BOLTON</p>
        </div>
    </>         
}
