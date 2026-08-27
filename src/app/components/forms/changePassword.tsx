"use client"
import {Button} from "@mui/joy";
import React, {useState} from "react";
import toast from "react-hot-toast";
import {changePassword} from "@/lib/auth";
import {describeError} from "@/lib/utils/errors";

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordForm(props: {onStart: () => void, onComplete: (success: boolean) => void})
{
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent) =>
    {
        e.preventDefault();
        if(submitting)
            return;

        if(currentPassword == "" || newPassword == "" || confirmPassword == "")
        {
            toast.error("Fill in every field");
            return;
        }
        if(newPassword.length < MIN_PASSWORD_LENGTH)
        {
            toast.error(`Your new password needs at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }
        if(newPassword != confirmPassword)
        {
            toast.error("The new passwords don't match");
            return;
        }
        if(newPassword == currentPassword)
        {
            toast.error("Your new password is the same as your current one");
            return;
        }

        setSubmitting(true);
        props.onStart();
        const toastId = toast.loading("Checking your current password…");

        let result: Awaited<ReturnType<typeof changePassword>>;
        try
        {
            result = await changePassword(currentPassword, newPassword);
        }
        catch (error)
        {
            toast.error(describeError(error, "Could not change your password"), {id: toastId});
            props.onComplete(false);
            return;
        }
        finally
        {
            setSubmitting(false);
        }

        if(result.success)
        {
            toast.success("Password changed", {id: toastId});
        }
        else
        {
            // Only the field that's wrong is cleared, so a typo in the current
            // password doesn't cost the whole form.
            setCurrentPassword("");
            toast.error(result.error ?? "Failed to change password", {id: toastId});
        }

        props.onComplete(result.success);
    };

    return <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="Current password" id="currentPassword" value={currentPassword}
               autoComplete="current-password" onChange={setCurrentPassword}/>
        <Field label="New password" id="newPassword" value={newPassword}
               autoComplete="new-password" onChange={setNewPassword}
               hint={`At least ${MIN_PASSWORD_LENGTH} characters`}/>
        <Field label="Confirm new password" id="confirmPassword" value={confirmPassword}
               autoComplete="new-password" onChange={setConfirmPassword}/>
        <Button type="submit" size="lg" disabled={submitting}
                className="!bg-accent-100 hover:!bg-accent-200 !text-white disabled:!opacity-50">
            Change Password
        </Button>
    </form>
}

function Field(props: {label: string, id: string, value: string, autoComplete: string, hint?: string, onChange: (value: string) => void})
{
    return <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text-200" htmlFor={props.id}>{props.label}</label>
        <input id={props.id} type="password" autoComplete={props.autoComplete} value={props.value}
               onChange={(e) => props.onChange(e.target.value)}
               className="w-full p-2 text-sm rounded-md bg-bg-200 border border-bg-300 text-text-100 focus:outline-none focus:border-accent-100 transition duration-150 ease-out"/>
        {props.hint && <span className="text-xs text-text-200 opacity-70">{props.hint}</span>}
    </div>
}
