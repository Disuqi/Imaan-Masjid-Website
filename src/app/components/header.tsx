"use client"
import Link from "next/link";
import {ScreenSize} from "@/app/constants";
import {useEffect, useState} from "react";
import {Button, Drawer} from "@mui/joy";
import {LuMenu} from "react-icons/lu";

export default function Header()
{
    const date = new Date();
    const monthName: string = date.toLocaleString('default', { month: 'long' });
    const menuItems =
        [
            { key:0, title: monthName + " Timetable", link: "/timetable"},
            { key:1, title: "Home", link: "/"},
            { key:2, title: "Events", link: "/events"},
            { key:3, title: "About", link: "/#about"},
        ];

    const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize>(widthToScreenSize(window.innerWidth));

    useEffect(() => {
        const updateScreenSize = () =>
        {
            setCurrentScreenSize(widthToScreenSize(window.innerWidth));
        }
        window.addEventListener('resize', updateScreenSize);
        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return <>
        <nav className="h-[8vh] border-b sticky top-0 left-0 w-full bg-white z-10">
            <div className="container mx-auto flex flex-row items-center w-full h-full">
                <Link href="/" className="text-3xl font-black mx-auto hover:text-blue-200 transition duration-150 ease-out">Imaan Masjid</Link>
                {currentScreenSize > ScreenSize.md ?
                    <div className="flex flex-row gap-12 justify-center items-center mx-auto">
                        {menuItems.map((item) =>
                            // eslint-disable-next-line react/jsx-key
                            (<div>
                                <Link href={item.link}
                                      className="text-lg font-semibold hover:text-blue-300 transition duration-150 ease-in-out cursor-pointer">{item.title}</Link>
                            </div>))}
                        <Link href="/donate"
                              className="px-4 py-2 bg-gradient-to-r from-[#7F7FD5] via-[#86A8E7] to-[#91EAE4] rounded-md text-white background-animate cursor-pointer hover:brightness-110 transition duration-150 ease-in-out font-semibold">Donate</Link>
                    </div>
                    :
                    <div className="mx-auto">
                        <Button variant="plain" size="lg" color="neutral" onClick={() => setIsMenuOpen(true)}>
                            <LuMenu className="text-3xl"/>
                        </Button>
                        <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                            <div className="flex flex-col justify-start gap-2 items-start mt-10 w-full">
                                {menuItems.map((item) =>
                                    // eslint-disable-next-line react/jsx-key
                                    (<Link key={item.key} onClick={() => setIsMenuOpen(false)} href={item.link} scroll={true}
                                              className="w-full pl-10 py-4 text-xl font-semibold hover:bg-blue-100 transition duration-150 ease-in-out cursor-pointer">
                                        {item.title}
                                    </Link>))}
                                <Link href="/donate" className="w-full pl-10 py-4 bg-gradient-to-r from-[#7F7FD5] via-[#86A8E7] to-[#91EAE4] text-white background-animate cursor-pointer text-lg hover:brightness-110 transition duration-150 ease-in-out font-semibold">Donate</Link>
                            </div>
                        </Drawer>
                    </div>
                }
            </div>
        </nav>
    </>;
}

function widthToScreenSize(screenWidth) : ScreenSize
{
    let screenSize: ScreenSize = ScreenSize.sm;

    if (screenWidth >= ScreenSize.md) {
        screenSize = ScreenSize.md;
    }
    if (screenWidth >= ScreenSize.lg) {
        screenSize = ScreenSize.lg;
    }
    if (screenWidth >= ScreenSize.xl) {
        screenSize = ScreenSize.xl;
    }
    if (screenWidth >= ScreenSize.xxl) {
        screenSize = ScreenSize.xxl;
    }
    return screenSize;
}