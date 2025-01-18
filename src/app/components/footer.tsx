import Link from "next/link";

export default function Footer()
{
    return<>
        <div id="footer" className="bg-bg-200 pb-20 text-text-200">
            <div className="container mx-auto flex sm:flex-row flex-col gap-20 justify-center px-10 items-start pt-10 w-full h-full">
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-xl lg:text-3xl">About Us</h1>
                    <div className="text-md lg:text-lg flex flex-col gap-2">
                        <Link href="/#about" className="hover:text-primary-100 transition duration-100 ease-out">About</Link>
                        <Link href="/events" className="hover:text-primary-100 transition duration-100 ease-out">Events</Link>
                        <Link href="#footer" className="hover:text-primary-100 transition duration-100 ease-out">Contact</Link>
                        <Link href="/donate" className="hover:text-primary-100 transition duration-100 ease-out">Donate</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-xl lg:text-3xl">Useful Links</h1>
                    <div className="text-md lg:text-lg flex flex-col gap-2">
                        <Link href="/timetable" className="hover:text-primary-100 transition duration-100 ease-out">Prayers Timetable</Link>
                        <Link href="#footer" className="hover:text-primary-100 transition duration-100 ease-out">Counselling Services</Link>
                        <Link href="#footer" className="hover:text-primary-100 transition duration-100 ease-out">Quran Classes</Link>
                        <Link href="#footer" className="hover:text-primary-100 transition duration-100 ease-out">Volunteer</Link>
                        <div className="flex flex-row gap-4 justify-start items-center">
                            <Link href="https://www.facebook.com/ImaanMasjd/" target="_blank" className="hover:text-primary-100 transition duration-100 ease-out">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                     className="w-6 h-6" viewBox="0 0 16 16">
                                    <path
                                        d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                                </svg>
                            </Link>
                            <Link href="https://www.youtube.com/channel/UCXJ70ltpLmkkke_VMyH5uRQ" target="_blank" className="hover:text-primary-100 transition duration-100 ease-out">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                     className="h-6 w-6" viewBox="0 0 16 16">
                                    <path
                                        d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 md:px-16">
                    <h1 className="font-bold text-xl lg:text-3xl">Contact Info</h1>
                    <div className="text-md lg:text-lg flex flex-col gap-2">
                        <div className="flex flex-row justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                            </svg>
                            <p>270 Bridgeman Street<br/>Bolton<br/>BL3 6SA</p>
                        </div>
                        <div className="flex flex-row items-center justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                            </svg>
                            <p>+44 7581 358270</p>
                        </div>
                        <div className="flex flex-row items-center justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                            </svg>
                            <p>Rizgarib@gmail.com</p>
                        </div>
                        <div className="flex flex-row items-center justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p>Dhuhur - Isha</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
}