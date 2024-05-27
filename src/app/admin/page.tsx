"use client"
import {FormEvent, useEffect, useState} from "react";
import SignInForm from "@/app/components/forms/admin_signin";
import toast, {Toaster} from "react-hot-toast";
import AddEventBtn from "@/app/components/buttons/addEvent";
import RemoveEventBtn from "@/app/components/buttons/removeEvent";
import {Button} from "@mui/joy";
import LoadingAnimation from "@/app/components/elements/loading";
import AddPrayerTimesBtn from "@/app/components/buttons/addPrayerTimes";
import {Size} from "@/lib/utils/size";
import RemovePrayerTimesBtn from "@/app/components/buttons/removePrayerTimes";
import { getUser, signOut } from "@/lib/auth";

export default function Page()
{
    const [adminSignedIn, setAdminSignedIn] = useState(null);
    const loading = adminSignedIn == null;

    const signOutAdmin = async () =>
    {
        await signOut();
        setAdminSignedIn(false);
        toast("Signed out");
    }

    useEffect(() =>
    {
        getUser().then((response) =>
        {
            if(response)
            {
                setAdminSignedIn(true);
            }
            else
            {
                setAdminSignedIn(false);
            }
        });
    }, []);

    return <>
        <div className="w-full h-[54.65vh] flex justify-center items-center">
            <LoadingAnimation state={loading} size={Size.L}/>
            {adminSignedIn ?
                    <>
                        <div className="flex flex-col justify-center items-center gap-6">
                            <h1 className="text-3xl font-bold">Admin Panel</h1>
                            <div className="flex flex-col gap-2 justify-center items-center">
                                <div className="flex flex-row gap-2 justify-start items-center w-full">
                                    <h1 className="font-semibold text-2xl m-2">Events</h1>
                                    <AddEventBtn/>
                                    <RemoveEventBtn/>
                                </div>
                                <div className="flex flex-row gap-2 w-full justify-start items-center">
                                    <h1 className="font-semibold text-2xl m-2">Prayer Times</h1>
                                    <AddPrayerTimesBtn/>
                                    <RemovePrayerTimesBtn/>
                                </div>
                            </div>
                            <Button component="div" color="danger" size="lg" onClick={signOutAdmin}>
                                Sign Out
                            </Button>
                        </div>
                    </>
                    :
                    <SignInForm onSuccessfullSignIn={() => setAdminSignedIn(true)}/>
            }
        </div>
        <Toaster position="top-center"/>
    </>;
}