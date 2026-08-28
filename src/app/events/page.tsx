"use client"
import React, {useEffect} from "react";
import ShareButton from "@/app/components/buttons/share";
import EditEventBtn from "@/app/components/buttons/editEvent";
import {AspectRatio, Button, Card, CardContent, CardOverflow, Divider, Tooltip, Typography} from "@mui/joy";
import {Event} from "@/lib/entities/event";
import { IoTrashBin } from "react-icons/io5";
import LoadingAnimation from "@/app/components/elements/loading";
import toast from "react-hot-toast";
import {DefaultMessage} from "@/app/components/defaultMessage";
import { deleteEvent, deleteImage, getEvents } from "@/lib/events";
import { getUser } from "@/lib/auth";
import {describeError} from "@/lib/utils/errors";

export default function Page() {
    const [events, setEvents] = React.useState<Event[]>(null);
    const [adminSignedIn, setAdminSignedIn] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        getEvents().then((events) =>
        {
            events.forEach((event) => {
                if(event.date)
                    event.date = new Date(event.date);
            });
            setEvents(events ?? []);
        })
        .catch((error) =>
        {
            setEvents([]);
            toast.error(describeError(error, "Could not load events"));
        })
        .finally(() => setLoading(false));

        // A failure here only costs the admin controls, so it is logged rather
        // than shown to every visitor.
        getUser()
            .then((response) => setAdminSignedIn(response != null))
            .catch((error) => console.error("Could not check the admin session: " + describeError(error, "unknown error")));
    }, []);

    // Events arrive after mount, so the browser has nothing to jump to when a
    // shared /events#some-event link is opened. Scroll to it once it exists.
    useEffect(() => {
        if(events == null || window.location.hash.length < 2)
            return;

        const target = document.getElementById(window.location.hash.slice(1));
        target?.scrollIntoView({behavior: "smooth"});
    }, [events]);

    const onDeleteEvent = async (event : Event) =>
    {
        const toastId = toast.loading("Deleting event…");

        try
        {
            if(event.image != null)
            {
                const imageDeleted = await deleteImage(event);
                if(!imageDeleted)
                {
                    toast.error("Failed to delete image", {id: toastId});
                    return;
                }
            }

            const deleted = await deleteEvent(event);
            if (deleted)
            {
                toast.success("Successfully deleted event", {id: toastId});
                setEvents(events.filter((e) => e.id != event.id));
            }else
            {
                toast.error("Failed to delete event", {id: toastId});
            }
        }
        catch (error)
        {
            toast.error(describeError(error, "Failed to delete event"), {id: toastId});
        }
    };

    const onUpdateEvent = (updated : Event) =>
    {
        if(updated.date)
            updated.date = new Date(updated.date);

        setEvents(events.map((e) => e.id == updated.id ? updated : e));
    };

    // Past events are hidden from visitors — the heading promises upcoming ones
    // — but kept visible to an admin so they can still be edited or removed.
    const upcoming = (events ?? []).filter((event) => !isPast(event));
    const past = (events ?? []).filter(isPast);
    const hasAnything = upcoming.length > 0 || (adminSignedIn && past.length > 0);

    const renderCard = (event: Event, muted: boolean) =>
        <div key={event.id ?? event.title}
             id={titleToId(event.title)}
             className="scroll-mt-28 animate-fade-up transition-transform duration-300 hover:-translate-y-1">
            <Card variant="outlined" sx={{width: "24rem", maxWidth: "100%", opacity: muted ? 0.65 : 1}}>
                {event.imageUrl &&
                    <CardOverflow>
                        <AspectRatio ratio="2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={event.imageUrl} alt={event.title}/>
                        </AspectRatio>
                    </CardOverflow>
                }
                <CardContent>
                    <div className="flex flex-col gap-2 justify-center">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <Typography level="title-md">{event.title}</Typography>
                            <div className="flex flex-row items-center shrink-0">
                                {adminSignedIn &&
                                    <>
                                        <EditEventBtn event={event} onUpdated={onUpdateEvent}/>
                                        <Tooltip title="Delete">
                                            <Button variant="plain" color="danger" size="sm" onClick={() => onDeleteEvent(event)}>
                                                <IoTrashBin/>
                                            </Button>
                                        </Tooltip>
                                    </>
                                }
                                <ShareButton title={event.title} url={"/events#" + titleToId(event.title)}/>
                            </div>
                        </div>
                        <Typography level="body-sm">{event.description}</Typography>
                    </div>
                </CardContent>
                {event.date &&
                    <CardOverflow variant="soft" sx={{ bgcolor: 'background.level1' }}>
                        <Divider inset="context" />
                        <CardContent orientation="horizontal">
                            <Typography level="body-xs" fontWeight="sm" textColor="text.secondary">
                                Date
                            </Typography>
                            <Typography level="body-xs" fontWeight="md" textColor="text.secondary">
                                {event.date.toLocaleDateString()}
                            </Typography>

                            {
                                (event.date.getHours() != 0 || event.date.getMinutes() != 0) &&
                                <>
                                    <Divider orientation="vertical" />
                                    <Typography level="body-xs" fontWeight="sm" textColor="text.secondary">
                                        Time
                                    </Typography>
                                    <Typography level="body-xs" fontWeight="md" textColor="text.secondary">
                                        {formatTime(event.date)}
                                    </Typography>
                                </>
                            }

                        </CardContent>
                    </CardOverflow>}
            </Card>
        </div>;

return <div className="container mx-auto px-4 min-h-[54.65vh] w-full relative">
        <LoadingAnimation state={loading}/>
        {
            hasAnything ?
                <div className="flex flex-col justify-start items-center">
                    {upcoming.length > 0 &&
                        <>
                            <h1 className="text-3xl font-bold mt-10 animate-fade-in">Upcoming Events</h1>
                            <div className="flex flex-row gap-10 flex-wrap justify-center m-10">
                                {upcoming.map((event) => renderCard(event, false))}
                            </div>
                        </>}
                    {adminSignedIn && past.length > 0 &&
                        <>
                            <h2 className="text-2xl font-semibold mt-6 text-text-200 animate-fade-in">
                                Past Events <span className="text-base font-normal opacity-70">(only visible to admins)</span>
                            </h2>
                            <div className="flex flex-row gap-10 flex-wrap justify-center m-10">
                                {past.map((event) => renderCard(event, true))}
                            </div>
                        </>}
                </div>
            :
            !loading && <DefaultMessage message="No Upcoming Events"/>
        }
    </div>;
}

/** An event stays listed for the whole of its own day. */
function isPast(event: Event) : boolean
{
    if(event.date == null)
        return false;

    const endOfDay = new Date(event.date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime() < Date.now();
}

function formatTime(date: Date) : string
{
    const formattedHours = String(date.getHours()).padStart(2, '0');
    const formattedMinutes = String(date.getMinutes()).padStart(2, '0');

    return formattedHours + ":" + formattedMinutes;
}

function titleToId(title: string) : string
{
    // Kept to characters that survive a URL fragment, so shared links resolve.
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
