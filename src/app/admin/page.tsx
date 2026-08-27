"use client"
import {ReactNode, useEffect, useState} from "react";
import SignInForm from "@/app/components/forms/admin_signin";
import toast from "react-hot-toast";
import AddEventBtn from "@/app/components/buttons/addEvent";
import RemoveEventBtn from "@/app/components/buttons/removeEvent";
import {Button} from "@mui/joy";
import LoadingAnimation from "@/app/components/elements/loading";
import AddPrayerTimesBtn from "@/app/components/buttons/addPrayerTimes";
import {Size} from "@/lib/utils/size";
import RemovePrayerTimesBtn from "@/app/components/buttons/removePrayerTimes";
import { AdminUser, getUser, signOut } from "@/lib/auth";
import {IoCalendarOutline, IoLockClosedOutline, IoLogOutOutline, IoMailOutline, IoTimeOutline} from "react-icons/io5";
import ChangePasswordBtn from "@/app/components/buttons/changePassword";
import CopyableEmail from "@/app/components/elements/copyableEmail";
import {DEVELOPER_EMAIL} from "@/app/constants";
import {notifyAdminAuthChanged} from "@/lib/utils/authEvents";
import {describeError} from "@/lib/utils/errors";

export default function Page()
{
    // undefined while the session is still being checked, null when signed out.
    const [admin, setAdmin] = useState<AdminUser>(undefined);
    const [signingOut, setSigningOut] = useState(false);
    const loading = admin === undefined;
    const adminSignedIn = admin != null;

    const signOutAdmin = async () =>
    {
        if(signingOut)
            return;

        setSigningOut(true);
        const toastId = toast.loading("Signing out…");

        try
        {
            await signOut();
        }
        catch (error)
        {
            toast.error(describeError(error, "Could not sign out"), {id: toastId});
            return;
        }
        finally
        {
            setSigningOut(false);
        }

        setAdmin(null);
        notifyAdminAuthChanged();
        toast.success("Signed out", {id: toastId});
    }

    useEffect(() =>
    {
        getUser()
            .then((response) => setAdmin(response))
            .catch((error) =>
            {
                // Fall back to the sign-in form rather than a stuck spinner.
                setAdmin(null);
                toast.error(describeError(error, "Could not check your session"));
            });
    }, []);

return <main className="container mx-auto px-4 py-10 md:py-16 min-h-[54.65vh] relative flex flex-col">
        <LoadingAnimation state={loading} size={Size.L}/>
        {adminSignedIn ?
            <div className="flex flex-col gap-8 animate-fade-up">
                <div className="flex flex-row flex-wrap gap-4 justify-between items-end border-b border-bg-300 pb-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
                        <p className="text-sm text-text-200 opacity-80">
                            Manage the events and prayer timetable shown on the site.
                        </p>
                        {admin?.email &&
                            <p className="text-sm text-text-200 opacity-60">
                                Signed in as <span className="font-semibold">{admin.email}</span>
                            </p>}
                    </div>
                    <Button component="div" variant="outlined" color="neutral" size="lg"
                            startDecorator={<IoLogOutOutline/>}
                            disabled={signingOut}
                            onClick={signOutAdmin}
                            className="!border-bg-300 !text-text-100 hover:!bg-bg-200 transition duration-150 ease-in-out">
                        Sign Out
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <AdminSection
                        icon={<IoCalendarOutline/>}
                        title="Events"
                        description="Add an event with an optional cover image, date and time. Removing an event is done from the events page.">
                        <AddEventBtn/>
                        <RemoveEventBtn/>
                    </AdminSection>

                    <AdminSection
                        icon={<IoTimeOutline/>}
                        title="Prayer Times"
                        description="Upload a month of prayer times from a PDF or CSV, or remove a month that was uploaded previously.">
                        <AddPrayerTimesBtn/>
                        <RemovePrayerTimesBtn/>
                    </AdminSection>

                    <AdminSection
                        icon={<IoLockClosedOutline/>}
                        title="Account"
                        description="Change the password used to sign in to this panel.">
                        <ChangePasswordBtn/>
                    </AdminSection>

                    <AdminSection
                        icon={<IoMailOutline/>}
                        title="Contact Developer"
                        description="Something not working, or a timetable refusing to convert? Copy the address below and get in touch.">
                        <CopyableEmail email={DEVELOPER_EMAIL}/>
                    </AdminSection>
                </div>
            </div>
            :
            <div className="flex-1 flex justify-center items-center py-6">
                {!loading && <SignInForm onSuccessfullSignIn={(user) => { setAdmin(user); notifyAdminAuthChanged(); }}/>}
            </div>
        }
    </main>;
}

function AdminSection(props: {icon: ReactNode, title: string, description: string, children: ReactNode})
{
    return <section className="flex flex-col gap-5 p-6 rounded-xl bg-bg-200 border border-bg-300 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-row gap-3 items-center">
            <span className="flex justify-center items-center w-10 h-10 rounded-lg bg-accent-100/20 text-accent-100 text-xl">
                {props.icon}
            </span>
            <h2 className="text-2xl font-semibold">{props.title}</h2>
        </div>
        <p className="text-sm text-text-200 opacity-80 leading-relaxed">{props.description}</p>
        <div className="flex flex-row flex-wrap gap-3 mt-auto">
            {props.children}
        </div>
    </section>
}
