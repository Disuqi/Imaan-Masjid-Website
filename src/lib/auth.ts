"use server"
import supabase from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export async function getUser() : Promise<User>
{
    const result = await supabase.auth.getUser();
    if(result.error != null)
    {
        console.error("Failed to get user. Error: " + result.error.message);
        return null;
    }
    return result.data.user;
}

export async function signIn(email: string, password: string) : Promise<User>
{
    const result = await supabase.auth.signInWithPassword({email, password});
    if(result.error != null)
    {
        console.error("Failed to sign in. Error: " + result.error.message);
        return null;
    }
    return result.data.user;
}

export async function signOut() : Promise<{error: any}>
{
    return supabase.auth.signOut();
}
