"use client"
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Select, Option} from "@mui/joy";
import {useState} from "react";
import LoadingAnimation from "@/app/components/elements/loading";
import {Size} from "@/lib/utils/size";
import toast from "react-hot-toast";
import { getPrayerDates, removePrayerTimes } from "@/lib/prayers";

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
        const allPrayerTimes = await getPrayerDates();
        if(allPrayerTimes == null)
        {
            setLoading(false);
            setModalState(false);
            return;
        }
        const months = allPrayerTimes.map(getMonthName);
        const uniqueMonthNames: Set<string> = new Set(months);

        setOptions(Array.from(uniqueMonthNames));
        setLoading(false);
    };

    const onClickRemovePrayerTimes = async () =>
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

        const success = await removePrayerTimes(firstDate, lastDate);
        if(success)
            toast.success("Prayer times removed successfully");
        else
            toast.error("Failed to remove prayer times");

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
                    <Button component="div" className="ml-auto" color="danger" onClick={onClickRemovePrayerTimes}>Remove</Button>
                </DialogContent>
            </ModalDialog>
        </Modal>
    </>
}

function getMonthName(date: Date): string
{
const options: Intl.DateTimeFormatOptions = { month: 'long' };
return date.toLocaleDateString('en-US', options);
}