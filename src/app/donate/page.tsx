import {FaArrowDownLong} from "react-icons/fa6";
import LinkButton from "@/app/components/buttons/linkButton";
import Reveal from "@/app/components/elements/reveal";
import Image from "next/image";
import prayerRugImage from "../../../public/prayer-rug.png";
import wallImage from "../../../public/wall.png";
import loanImage from "../../../public/loan.png";

export default function Page()
{
    return <>
        <div className="w-full mb-10">
            <h1 className="bg-accent-100 py-4 px-6 font-bold text-white text-3xl text-center animate-fade-in">MASJID URGENT APPEAL</h1>
        </div>
        <div className="container mx-auto w-full h-full flex justify-center items-center">
            <div className="md:mx-20 mx-10 flex flex-col justify-center items-center">
                <div className="min-h-[80vh] flex flex-col justify-evenly items-center gap-5 w-full">
                    <Reveal className="bg-primary-100 border border-primary-200 py-4 px-6 rounded-md w-full text-center flex flex-col gap-5 shadow-lg">
                        <div className="flex flex-col justify-center items-center text-center gap-2">
                            <h1 className="font-bold text-2xl text-accent-200">Surat Al-Baqarah [2:245]</h1>
                            <div className="m-2 flex flex-row gap-1 text-3xl justify-center items-center">
                                <p>مَّن ذَا ٱلَّذِى يُقْرِضُ ٱللَّهَ قَرْضًا حَسَنًۭا فَيُضَـٰعِفَهُۥ لَهُۥٓ أَضْعَافًۭا كَثِيرَةًۭ ۚ
                                    وَٱللَّهُ يَقْبِضُ وَيَبْصُۜطُ وَإِلَيْهِ تُرْجَعُونَ</p>
                            </div>
                            <p className="text-lg">
                                Who will lend to Allah a good loan which Allah will multiply many times over? It is Allah ˹alone˺ who
                                decreases and increases ˹wealth˺. And to Him you will ˹all˺ be returned.
                            </p>
                        </div>
                        <div className="border border-primary-200"></div>
                        <div className="flex flex-col justify-center items-center text-center gap-2">
                            <h1 className="font-bold text-2xl text-accent-200">Sunan Ibn Majah, Kitab al-Masajid wal Jamaah, Hadith 738</h1>
                            <div className="m-2 flex flex-row gap-1 text-3xl justify-center items-center">
                                <p>عَنْ جَابِرِ بْنِ عَبْدِ اللہِ، أَنَّ رَسُولَ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ قَالَ، مَنْ بَنَى
                                    مَسْجِدًا لِلهِ كَمَفْحَصِ قَطَاةٍ أَوْ أَصْغَرَ بَنَى اللهُ لَهُ بَيْتًا فِى الْجَنَّةِ</p>
                            </div>
                            <p className="text-lg">
                                Whoever builds a mosque for the sake of Allah, like a sparrow’s nest for Allah or even smaller, Allah
                                will build for him a house in Paradise.
                            </p>
                        </div>
                    </Reveal>
                    <div className="text-lg">
                        <p>Please help the masjid towards running costs such as gas and electricity. Also, the masjid needs your
                            support to organise conferences and events to gain beneficial knowledge.
                            <br/>
                            Additionally, help the masjid to clear its £142,000 debt and earn Sadaqah Jariyah.</p>
                    </div>
                    <LinkButton href="#donationDetails" variant="plain" size="lg" endDecorator={<FaArrowDownLong/>} className="bg-bg-100 hover:bg-primary-100 text-text-100 transition duration-150 ease-in-out">
                        Donate
                    </LinkButton>
                </div>
                <div id="donationDetails" className="min-h-[100vh] flex flex-col justify-center items-center w-full">
                    <Reveal>
                        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 text-xl font-bold mt-10 w-full">
                            <div className="flex flex-row items-center gap-2 bg-bg-200 border border-bg-300 rounded-xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <h1 className="font-black text-3xl m-2 text-accent-200">1.</h1>
                                <h1 className="w-full">£350 Per Prayer Mat</h1>
                                <Image className="w-full h-32 object-contain" src={prayerRugImage} alt="prayer rug"/>
                            </div>
                            <div className="flex flex-row items-center gap-2 bg-bg-200 border border-bg-300 rounded-xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <h1 className="font-black text-3xl m-2 text-accent-200">2.</h1>
                                <h1 className="w-full">£50 Per Brick</h1>
                                <Image className="w-full h-24 object-contain" src={wallImage} alt="brick wall"/>
                            </div>
                            <div className="flex flex-row items-center gap-2 bg-bg-200 border border-bg-300 rounded-xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <h1 className="font-black text-3xl m-2 text-accent-200">3.</h1>
                                <h1 className="w-full">Long Term Loan</h1>
                                <Image className="w-full h-28 object-contain" src={loanImage} alt="money"/>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal className="flex flex-col gap-2 m-10 justify-center items-start bg-bg-200 border border-bg-300 rounded-xl p-8 shadow-md">
                        <h1 className="font-black text-3xl">Bank Details</h1>
                        <div className="font-bold text-xl">
                            <h1>Lloyds Bank</h1>
                            <h1>Bolton Kurdish Academy</h1>
                            <div className="flex flex-row gap-2 justify-start items-center">
                                <h1>Account Number: </h1>
                                <p className="font-medium">41349660</p>
                            </div>
                            <div className="flex flex-row gap-2 justify-start items-center">
                                <h1>Sort Code: </h1>
                                <p className="font-medium">30-91-97</p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    </>;
}