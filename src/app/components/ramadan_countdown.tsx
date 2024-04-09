export default function RamadanCountdown()
{
        return <div className="container mx-auto flex flex-col md:flex-row justify-center gap-10 md:gap-0 md:justify-evenly items-center">
            <div className="flex flex-col justify-center">
                <div className="flex">
                    <h1 className="px-2 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-white background-animate text-4xl md:text-6xl font-black">EID AL-FITR
                        2024</h1>
                </div>
                <h2 className="ml-auto text-2xl md:text-3xl font-black">SALAH</h2>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <h1 className="text-center font-bold text-3xl">9:00 am<br/>At the Masjid</h1>
                <p className="text-gray-300 font-semibold">10/04/2024</p>
            </div>
        </div>
}