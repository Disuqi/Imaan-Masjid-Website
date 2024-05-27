"use client"
import { signIn } from "@/lib/auth";
import {Button} from "@mui/joy";
import {useState} from "react";
import toast from "react-hot-toast";

export default function SignInForm(props: {onSuccessfullSignIn: () => void})
{
    const [formData, setFormData] = useState({});

    const handleFormChange = (event) =>
    {
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    }

    const signInAdmin = () =>
    {
        const email = formData["email"];
        const password = formData["password"];
        signIn(email, password).then((response) =>
        {
            if(response)
            {
                toast.success("Signed in");
                props.onSuccessfullSignIn();
            }else
            {
                toast.error("Incorrect credentials");
            }
        });
    }

    return <form className="flex flex-col gap-2 justify-center items-start border border-gray-200 p-8" onChange={handleFormChange}>
            <h1 className="text-4xl font-bold">Admin Sign In</h1>
            <div className="flex flex-col">
                <label className="text-md text-gray-300">Email</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="email" name="email"/>
            </div>
            <div className="flex flex-col">
                <label className="text-md text-gray-300">Password</label>
                <input className="p-1 text-sm border border-gray-200 rounded" type="password" name="password"/>
            </div>
            <div className="text-center w-full mt-2">
                <Button component="div" onClick={signInAdmin}>Sign In</Button>
            </div>
        </form>;
}