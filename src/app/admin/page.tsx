"use client"
import {FormEvent, useEffect, useState} from "react";
import SignInForm from "@/app/components/forms/admin_signin";
import toast, {Toaster} from "react-hot-toast";
import AddEventBtn from "@/app/components/buttons/addEvent";
import EditEventBtn from "@/app/components/buttons/editEvent";
import RemoveEventBtn from "@/app/components/buttons/removeEvent";
import supabase from "@/lib/supabase";
import {Button} from "@mui/joy";
import LoadingAnimation from "@/app/components/utils/loading";

export default function Page()
{
    const [adminSignedIn, setAdminSignedIn] = useState(null);

    const signInAdmin = () =>
    {
        setAdminSignedIn(true);
        toast.success("Signed in as admin");
    }
    const signOutAdmin = async () =>
    {
        await supabase.auth.signOut();
        setAdminSignedIn(false);
        toast("Signed out");
    }

    const checkCredentials = async (event: FormEvent) =>
    {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const email : string = formData.get("email") as string;
        const password : string = formData.get("password") as string;

        supabase.auth.signInWithPassword({email, password}).then((response) =>
        {
            if(response.data.user != null)
            {
                signInAdmin();
            }
            if(response.error != null)
            {
                toast.error("Incorrect credentials");
            }
        });
    };

    useEffect(() =>
    {
        supabase.auth.getUser().then((response) =>
        {
            if(response.data.user != null)
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
            {adminSignedIn == null ? <LoadingAnimation/> :
                <>{adminSignedIn ?
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
                                        <p>Work in progress</p>
                                    </div>
                                </div>
                                <Button color="danger" size="lg" onClick={signOutAdmin}>
                                    Sign Out
                                </Button>
                            </div>
                        </>
                        :
                        <SignInForm onSubmit={checkCredentials}/>
                }</>
            }
        </div>
        <Toaster position="top-center"/>
    </>;
}