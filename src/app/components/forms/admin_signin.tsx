"use client"
import {FormEvent} from "react";
import {Button} from "@mui/joy";

export default function SignInForm(props: {onSubmit: (event: FormEvent) => void})
{
    return <form className="flex flex-col gap-2 justify-center items-start border border-gray-200 p-8" onSubmit={props.onSubmit}>
            <h1 className="text-4xl font-bold">Admin Sign In</h1>
            <div className="flex flex-col">
                <label className="text-md text-gray-300">Email</label>
                <input className="p-1 text-lg border border-gray-200 rounded" type="email" name="email"/>
            </div>
            <div className="flex flex-col">
                <label className="text-md text-gray-300">Password</label>
                <input className="p-1 text-lg border border-gray-200 rounded" type="password" name="password"/>
            </div>
            <div className="text-center w-full mt-2">
                <Button type="submit">Sign In</Button>
            </div>
        </form>;
}