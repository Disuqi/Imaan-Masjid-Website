"use client"
import React, {useEffect} from "react";
import ShareButton from "@/app/components/buttons/share";
import {AspectRatio, Button, Card, CardContent, CardOverflow, Divider, Typography} from "@mui/joy";
import {Event} from "@/lib/entities/event";
import { IoTrashBin } from "react-icons/io5";
import LoadingAnimation from "@/app/components/elements/loading";
import toast, {Toaster} from "react-hot-toast";
import Image from "next/image";
import {DefaultMessage} from "@/app/components/defaultMessage";
import { deleteEvent, deleteImage, getEvents } from "@/lib/events";
import { getUser } from "@/lib/auth";

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
            setLoading(false);
        });
        getUser().then((response) =>
        {
            setAdminSignedIn(true);
        });
    }, []);

    const onDeleteEvent = async (event : Event) =>
    {
        if(event.image != null)
        {
            const result1 = await deleteImage(event);
            if(!result1)
            {
                toast.error("Failed to delete image");
                return;
            }
        }

        const result2 = await deleteEvent(event);
        if (result2)
        {
            toast.success("Successfully deleted event");
            const updatedEvents = events.filter((e) => e.id != event.id);
            setEvents(updatedEvents);
        }else
        {
            toast.error("Failed to delete event");
        }
    };

    return <>
        <div className="container mx-auto min-h-[54.65vh] w-full relative">
            <LoadingAnimation state={loading}/>
            {
                events?.length > 0 ?
                    <div className="flex flex-col justify-start items-center">
                        <h1 className="text-3xl font-bold mt-10">Upcoming Events</h1>
                        <div className="flex flex-row gap-10 flex-wrap m-10">
                            {events.map((event) =>
                                    // eslint-disable-next-line react/jsx-key
                                    <div key={titleToId(event.title)}>
                                        <Card variant="outlined" sx={{width: "24rem"}}>
                                            {event.imageUrl &&
                                                <CardOverflow>
                                                    <AspectRatio ratio="2">
                                                        <img src={event.imageUrl} alt="Event Cover Image"/>
                                                    </AspectRatio>
                                                </CardOverflow>
                                            }
                                            <CardContent>
                                                <div className="flex flex-col gap-2 justify-center">
                                                    <div className="flex flex-row justify-between items-center">
                                                    <Typography level="title-md">{event.title}</Typography>
                                                    <div>
                                                        {adminSignedIn &&
                                                            <>
                                                                <Button variant="plain" color="danger" size="sm" onClick={() => onDeleteEvent(event)}>
                                                                    <IoTrashBin />
                                                                </Button>
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
                        </div>
                        )}
                    </div>
                </div>
                :
                <DefaultMessage message="No Upcoming Events"/>
            }
        </div>
        <Toaster position={"top-center"}/>
    </>;
}

function formatTime(date: Date) : string
{
    const formattedHours = String(date.getHours()).padStart(2, '0');
    const formattedMinutes = String(date.getMinutes()).padStart(2, '0');

    return formattedHours + ":" + formattedMinutes;
}

function titleToId(title: string) : string
{
    return title.toLowerCase().replace(/\s/g, '_');
}