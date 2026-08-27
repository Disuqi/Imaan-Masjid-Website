"use server"
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Only what the UI needs. The full Supabase User carries app/user metadata that
 * has no business being serialised into the page.
 */
export type AdminUser =
{
    id: string,
    email: string
}

export async function getUser() : Promise<AdminUser>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.auth.getUser();

    if(result.error != null)
    {
        // No session at all is the normal state for a visitor, so it is not
        // worth logging as an error.
        if(!isMissingSession(result.error))
            console.error("Failed to get user. Error: " + result.error.message);
        return null;
    }

    return toAdminUser(result.data.user);
}

export async function signIn(email: string, password: string) : Promise<AdminUser>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.auth.signInWithPassword({email, password});

    if(result.error != null)
    {
        console.error("Failed to sign in. Error: " + result.error.message);
        return null;
    }

    return toAdminUser(result.data.user);
}

export async function signOut() : Promise<boolean>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.auth.signOut();

    if(result.error != null && !isMissingSession(result.error))
    {
        console.error("Failed to sign out. Error: " + result.error.message);
        return false;
    }

    return true;
}

export type PasswordChangeResult =
{
    success: boolean,
    error?: string
}

/**
 * Changes the signed-in admin's password. The current password is verified by
 * re-authenticating first: Supabase's updateUser does not require it unless
 * "secure password change" is switched on for the project, and an admin panel
 * left open on a shared machine shouldn't hand over the account.
 */
export async function changePassword(currentPassword: string, newPassword: string) : Promise<PasswordChangeResult>
{
    const supabase = await createSupabaseClient();

    const currentUser = await supabase.auth.getUser();
    if(currentUser.error != null || currentUser.data.user == null)
    {
        return {success: false, error: "You are not signed in"};
    }

    const email = currentUser.data.user.email;
    if(email == null)
    {
        return {success: false, error: "This account has no email address to verify against"};
    }

    const reauth = await supabase.auth.signInWithPassword({email, password: currentPassword});
    if(reauth.error != null)
    {
        return {success: false, error: "Current password is incorrect"};
    }

    const result = await supabase.auth.updateUser({password: newPassword});
    if(result.error != null)
    {
        console.error("Failed to change password. Error: " + result.error.message);
        return {success: false, error: result.error.message};
    }

    return {success: true};
}

function toAdminUser(user: { id: string, email?: string }) : AdminUser
{
    if(user == null)
        return null;

    return { id: user.id, email: user.email ?? null };
}

function isMissingSession(error: { name?: string, message?: string }) : boolean
{
    return error.name == "AuthSessionMissingError" || error.message == "Auth session missing!";
}
