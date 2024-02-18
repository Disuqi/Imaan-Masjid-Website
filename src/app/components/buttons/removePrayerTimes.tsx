"use client"
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Select, Option} from "@mui/joy";
import {useState} from "react";
import LoadingAnimation from "@/app/components/utils/loading";
import {Size} from "@/app/components/utils/size";
import supabase from "@/lib/supabase";
import {dateToSupabaseDate, getHijriMonth} from "@/app/components/utils/date";
import toast from "react-hot-toast";

export default function RemovePrayerTimesBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(0);

    const openModal = async () =>
    {
        setModalState(true);
        const monthsMap = new Map<number, string>();
        const allPrayerTimes = (await supabase.from("DailyPrayers").select("date")).data;
        if(allPrayerTimes == null)
        {
            setLoading(false);
            setModalState(false);
            return;
        }
        const months = allPrayerTimes.map((prayerTime) => prayerTime["date"].substring(5, 7));
        months.forEach((month) => monthsMap.set(parseInt(month), new Date(2024, parseInt(month), 0).toLocaleString('default', { month: 'long' })));
        setOptions(Array.from(monthsMap));
        setLoading(false);
    };

    const removePrayerTimes = async () =>
    {
        if(selectedMonth == null)
            toast.error("Please select a month");

        setLoading(true);

        const firstDate = new Date();
        firstDate.setDate(1);
        firstDate.setMonth(selectedMonth - 1);

        const lastDate = new Date(firstDate);
        lastDate.setMonth(lastDate.getMonth() + 1);
        lastDate.setDate(lastDate.getDate() - 1);

        console.log(firstDate);
        console.log(lastDate);
        const result = await supabase.from("DailyPrayers").delete().gte("date", dateToSupabaseDate(firstDate)).lte("date", dateToSupabaseDate(lastDate));

        if(result.error != null)
            toast.error("Failed to remove prayer times");
        else
            toast.success("Prayer times removed successfully");

        setLoading(false);
        if (modalState)
            setModalState(false);
    }

    const selectMonth = (
        event: React.SyntheticEvent | null,
        newValue: string | null,
    ) => {
        setSelectedMonth(parseInt(newValue));
    };
    return <>
        <Button component="div" size="lg" onClick={openModal}>Remove</Button>
        <Modal open={modalState} onClose={() => setModalState(false)}>
            <ModalDialog>
                <LoadingAnimation state={loading} size={Size.M}/>
                <ModalClose/>
                <DialogTitle>Remove Prayer Times</DialogTitle>
                <DialogContent>
                    <div className="mb-5">
                        <Select id="select-month" placeholder="Choose a month…" onChange={selectMonth}>
                            {
                                // eslint-disable-next-line react/jsx-key
                                options.map(([key, value]) => <Option key={key} value={key}>{value}</Option>)
                            }
                        </Select>
                    </div>
                    <Button component="div" className="ml-auto" color="danger" onClick={removePrayerTimes}>Remove</Button>
                </DialogContent>
            </ModalDialog>
        </Modal>
    </>
}