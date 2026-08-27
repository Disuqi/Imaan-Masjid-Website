"use client"
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True once the component is running in the browser.
 *
 * Uses useSyncExternalStore rather than flipping a flag with setState inside an
 * effect: that pattern causes a cascading second render and is flagged by
 * react-hooks/set-state-in-effect.
 */
export function useIsClient() : boolean
{
    return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
