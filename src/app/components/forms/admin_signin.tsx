"use client"
import { AdminUser, signIn } from "@/lib/auth";
import {Button} from "@mui/joy";
import {FormEvent, useState} from "react";
import toast from "react-hot-toast";
import {describeError} from "@/lib/utils/errors";
import {IoLockClosedOutline} from "react-icons/io5";

export default function SignInForm(props: {onSuccessfullSignIn: (user: AdminUser) => void})
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signingIn, setSigningIn] = useState(false);

    // A real submit handler so Enter works from either field, instead of the
    // button being the only way in.
    const signInAdmin = async (e: FormEvent) =>
    {
        e.preventDefault();
        if(signingIn)
            return;

        if(email.trim() == "" || password == "")
        {
            toast.error("Enter your email and password");
            return;
        }

        setSigningIn(true);
        const toastId = toast.loading("Signing in…");

        let user: AdminUser;
        try
        {
            user = await signIn(email.trim(), password);
        }
        catch (error)
        {
            toast.error(describeError(error, "Could not sign in"), {id: toastId});
            return;
        }
        finally
        {
            setSigningIn(false);
        }

        if(user)
        {
            toast.success("Signed in", {id: toastId});
            props.onSuccessfullSignIn(user);
        }
        else
        {
            setPassword("");
            toast.error("Incorrect credentials", {id: toastId});
        }
    }

    return <form onSubmit={signInAdmin}
                 className="flex flex-col gap-6 w-full max-w-sm p-8 rounded-xl bg-bg-200 border border-bg-300 shadow-sm animate-scale-in">
        <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex justify-center items-center w-12 h-12 rounded-full bg-accent-100/20 text-accent-100 text-2xl">
                <IoLockClosedOutline/>
            </span>
            <h1 className="text-2xl font-bold">Admin Sign In</h1>
            <p className="text-sm text-text-200 opacity-80">Sign in to manage events and prayer times.</p>
        </div>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-text-200" htmlFor="adminEmail">Email</label>
                <input id="adminEmail" className={inputClass} type="email" name="email" autoComplete="username"
                       value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-text-200" htmlFor="adminPassword">Password</label>
                <input id="adminPassword" className={inputClass} type="password" name="password" autoComplete="current-password"
                       value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
        </div>
        <Button type="submit" size="lg" loading={signingIn} disabled={signingIn}
                className="!bg-accent-100 hover:!bg-accent-200 !text-white transition duration-150 ease-in-out">
            Sign In
        </Button>
    </form>;
}

const inputClass = "w-full p-2 text-sm rounded-md bg-bg-100 border border-bg-300 text-text-100 focus:outline-none focus:border-accent-100 transition duration-150 ease-out";
