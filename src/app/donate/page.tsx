import {Button} from "@mui/joy";
import {FaArrowDownLong} from "react-icons/fa6";
import Link from "next/link";
import img from "next/image";

export default function Page()
{
    return <>
        <div className="w-full mb-10">
            <h1 className="bg-accent-100 py-4 px-6 font-bold text-white text-3xl text-center">MASJID URGENT APPEAL</h1>
        </div>
        <div className="container mx-auto w-full h-full flex justify-center items-center">
            <div className="md:mx-20 mx-10 flex flex-col justify-center items-center">
                <div className="min-h-[80vh] flex flex-col justify-evenly items-center gap-5 w-full">
                    <div className="bg-primary-100 border border-primary-200 py-4 px-6 rounded-md w-full text-center flex flex-col gap-5">
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
                    </div>
                    <div className="text-lg">
                        <p>Please help the masjid towards running costs such as gas and electricity. Also, the masjid needs your
                            support to organise conferences and events to gain beneficial knowledge.
                            <br/>
                            Additionally, help the masjid to clear its £142,000 debt and earn Sadaqah Jariyah.</p>
                    </div>
                    <Link href="#donationDetails">
                        <Button className="bg-bg-100 hover:bg-primary-100 text-text-200" variant="plain" size="lg" endDecorator={<FaArrowDownLong/>}>
                            Donate
                        </Button>
                    </Link>
                </div>
                <div id="donationDetails" className="min-h-[100vh] flex flex-col justify-center items-center w-full">
                    <div>
                        <div className="flex md:flex-row md:justify-center md:items-center flex-col gap-10 text-xl font-bold mt-10 w-full justify-start items-start">
                            <div className="flex flex-row justify-center items-center gap-2">
                                <h1 className="font-black text-3xl m-2">1.</h1>
                                <h1 className="w-full">£350 Per Prayer Mat</h1>
                                <img className="w-full h-32 object-contain" src="/prayer-rug.png" alt="payer rug image"/>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-2">
                                <h1 className="font-black text-3xl m-2">2.</h1>
                                <h1 className="w-full">£50 Per Brick</h1>
                                <img className="w-full h-24 object-contain" src="/wall.png" alt="wall image"/>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-2">
                                <h1 className="font-black text-3xl m-2">3.</h1>
                                <h1 className="w-full">Long Term Loan</h1>
                                <img className="w-full h-28 object-contain" src="/loan.png" alt="money image"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 m-10 justify-center items-start">
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
                    </div>
                </div>
            </div>
        </div>
    </>;
}