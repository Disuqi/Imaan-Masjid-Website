/**
 * The header reads the admin session once on mount, so signing in or out
 * elsewhere on the page left it showing the wrong links until a reload. Pages
 * that change the session announce it here and the header re-checks.
 */
export const ADMIN_AUTH_CHANGED = "admin-auth-changed";

export function notifyAdminAuthChanged()
{
    if(typeof window == "undefined")
        return;

    window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED));
}
