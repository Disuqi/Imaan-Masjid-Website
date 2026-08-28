"use client"
import {Button, Select, Option} from "@mui/joy";
import React, {useState} from "react";
import toast from "react-hot-toast";
import { getPrayerDates, removePrayerTimes } from "@/lib/prayers";
import {describeError} from "@/lib/utils/errors";
import FormModal from "@/app/components/elements/formModal";
import {IoTrashBin} from "react-icons/io5";

type MonthOption = { name: string, value: string, year: number, month: number };

export default function RemovePrayerTimesBtn()
{
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState<string>(null);
    const [options, setOptions] = useState<MonthOption[]>([]);
    const [selected, setSelected] = useState<MonthOption>(null);
    const [confirming, setConfirming] = useState(false);

    const openModal = async () =>
    {
        setModalState(true);
        setSelected(null);
        setConfirming(false);
        setOptions([]);
        setLoadingText("Loading months…");
        setLoading(true);

        let allPrayerDates: Date[];
        try
        {
            allPrayerDates = await getPrayerDates();
        }
        catch (error)
        {
            setModalState(false);
            toast.error(describeError(error, "Couldn't load the uploaded months"));
            return;
        }
        finally
        {
            setLoading(false);
        }

        if(allPrayerDates == null)
        {
            setModalState(false);
            toast.error("Couldn't load the uploaded months");
            return;
        }

        // Key by year as well as month, otherwise the same month in two
        // different years collapses into one entry — and removing it deleted
        // the wrong year's times.
        const months = new Map<string, MonthOption>();
        allPrayerDates.forEach((date) =>
        {
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            const value = `${year}-${month}`;
            months.set(value, {
                name: new Date(Date.UTC(year, month)).toLocaleString('default', {month: 'long', year: 'numeric', timeZone: 'UTC'}),
                value: value,
                year: year,
                month: month
            });
        });

        setOptions(Array.from(months.values()).sort((a, b) => a.year - b.year || a.month - b.month));
    };

    const onClickRemovePrayerTimes = async () =>
    {
        if(selected == null)
        {
            toast.error("Choose a month first");
            return;
        }

        setLoadingText(`Removing ${selected.name}…`);
        setLoading(true);
        const toastId = toast.loading(`Removing prayer times for ${selected.name}…`);

        const firstDate = new Date(Date.UTC(selected.year, selected.month, 1));
        const lastDate = new Date(Date.UTC(selected.year, selected.month + 1, 0));

        let success = false;
        try
        {
            success = await removePrayerTimes(firstDate, lastDate);
        }
        catch (error)
        {
            toast.error(describeError(error, `Failed to remove prayer times for ${selected.name}`), {id: toastId});
            setConfirming(false);
            return;
        }
        finally
        {
            setLoading(false);
        }

        if(success)
        {
            toast.success(`Removed prayer times for ${selected.name}`, {id: toastId});
            setModalState(false);
        }
        else
        {
            toast.error(`Failed to remove prayer times for ${selected.name}`, {id: toastId});
            setConfirming(false);
        }
    }

    const selectMonth = (event: React.SyntheticEvent | null, newValue: string | null) =>
    {
        setSelected(options.find((option) => option.value == newValue) ?? null);
        setConfirming(false);
    };

    return <>
        <Button component="div" size="lg" variant="outlined" color="danger" startDecorator={<IoTrashBin/>} onClick={openModal}
                className="hover:!bg-red-500/10 transition duration-150 ease-in-out">
            Remove Month
        </Button>
        <FormModal
            open={modalState}
            title="Remove Prayer Times"
            description="Deletes every day of the selected month. This can't be undone."
            loading={loading}
            loadingText={loadingText}
            onClose={() => setModalState(false)}>
            {!loading && options.length == 0 ?
                <p className="text-sm text-text-200 py-4">No prayer times have been uploaded yet.</p>
                :
                <div className="flex flex-col gap-4">
                    <Select id="select-month" placeholder="Choose a month…" value={selected?.value ?? null} onChange={selectMonth}>
                        {options.map((month) => <Option key={month.value} value={month.value}>{month.name}</Option>)}
                    </Select>
                    {confirming ?
                        <div className="flex flex-col gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/40">
                            <p className="text-sm text-text-100">
                                Delete all prayer times for <span className="font-semibold">{selected?.name}</span>?
                            </p>
                            <div className="flex flex-row gap-2 justify-end">
                                <Button component="div" variant="plain" color="neutral" onClick={() => setConfirming(false)}>
                                    Cancel
                                </Button>
                                <Button component="div" color="danger" onClick={onClickRemovePrayerTimes}>
                                    Yes, remove
                                </Button>
                            </div>
                        </div>
                        :
                        <Button component="div" color="danger" disabled={selected == null} className="ml-auto"
                                onClick={() => setConfirming(true)}>
                            Remove
                        </Button>}
                </div>}
        </FormModal>
    </>
}
