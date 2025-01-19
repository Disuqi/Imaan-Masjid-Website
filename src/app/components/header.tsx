"use client"
import Link from "next/link";
import {ScreenSize} from "@/app/constants";
import {useEffect, useState} from "react";
import {Button, Drawer} from "@mui/joy";
import {LuMenu} from "react-icons/lu";
import {widthToScreenSize} from "@/lib/utils/screen";
import { getUser } from "@/lib/auth";
import ImaanMasjidLogo from "./logo";

export default function Header()
{
    const menuItems =
        [
            { key:0, title: "Full Timetable", link: "/timetable"},
            { key:1, title: "Home", link: "/"},
            { key:2, title: "Events", link: "/events"},
            { key:3, title: "About", link: "/#about"},
        ];

    const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize>(null);
    const [adminSignedIn, setAdminSignedIn] = useState(false);

    useEffect(() => {
        const updateScreenSize = () =>
        {
            setCurrentScreenSize(widthToScreenSize(window.innerWidth));
        }
        window.addEventListener('resize', updateScreenSize);
        updateScreenSize();
        getUser().then((response) =>
        {
            if(response)
            {
                setAdminSignedIn(true);
            }
        });

        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return <>
        <nav className="h-[8vh] sticky top-0 left-0 w-full bg-bg-100 z-10">
            <div className="container mx-auto flex flex-row items-center w-full h-full">
                <Link href="/" className="hover:text-accent-200 transition duration-150 ease-out mx-auto md:mx-0">
                    <ImaanMasjidLogo/>
                </Link>
                {currentScreenSize == null ?
                    <div className="mx-auto md:mx-0 md:ml-auto"></div>
                    :
                    <>
                        {
                            currentScreenSize > ScreenSize.md ?
                            <div className="flex flex-row gap-12 font-bold text-lg justify-center items-center mx-auto md:mx-0 md:ml-auto">
                                {menuItems.map((item) =>
                                    // eslint-disable-next-line react/jsx-key
                                    (<div key={item.key}>
                                        <Link href={item.link}
                                              className="hover:text-accent-200 transition duration-150 ease-in-out cursor-pointer">{item.title}</Link>
                                    </div>))}
                                {adminSignedIn &&
                                    <div>
                                        <Link href="/admin" className="hover:text-accent-200 transition duration-150 ease-in-out cursor-pointer">Admin Page</Link>
                                    </div>}
                                    <Link href="/donate"
                                        className="px-4 py-2 bg-gradient-to-r from-primary-100 via-accent-100 to-accent-200 rounded-md text-white background-animate cursor-pointer hover:brightness-110 transition duration-150 ease-in-out font-semibold">
                                        Donate
                                    </Link>
                            </div>
                            :
                            <div className="mx-auto md:mx-0 md:ml-auto">
                                <Button variant="plain" size="lg" color="neutral" onClick={() => setIsMenuOpen(true)}>
                                    <LuMenu className="text-3xl"/>
                                </Button>
                                <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                                    <div className="flex flex-col justify-start gap-2 items-start mt-10 w-full">
                                        {menuItems.map((item) =>
                                            // eslint-disable-next-line react/jsx-key
                                            (<Link key={item.key} onClick={() => setIsMenuOpen(false)} href={item.link} scroll={true}
                                                   className="w-full pl-10 py-4 text-xl font-semibold hover:bg-primary-100 transition duration-150 ease-in-out cursor-pointer">
                                                {item.title}
                                            </Link>))}
                                        {adminSignedIn && <Link onClick={() => setIsMenuOpen(false)} href={"/admin"} scroll={true}
                                                                className="w-full pl-10 py-4 text-xl font-semibold hover:bg-blue-100 transition duration-150 ease-in-out cursor-pointer">
                                            Admin Page
                                        </Link>}
                                        <Link href="/donate" onClick={() => setIsMenuOpen(false)} className="w-full pl-10 py-4 bg-gradient-to-r from-primary-100 via-accent-100 to-accent-200 text-white background-animate cursor-pointer text-lg hover:brightness-110 transition duration-150 ease-in-out font-semibold">Donate</Link>
                                    </div>
                                </Drawer>
                            </div>
                        }
                    </>
                }
            </div>
        </nav>
    </>;
}
