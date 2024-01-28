"use client"
import React, {useEffect} from "react";
import ShareButton from "@/app/components/buttons/share";
import {AspectRatio, Button, Card, CardContent, CardOverflow, Divider, Typography} from "@mui/joy";
import {Event} from "@/app/entities/event";
import supabase from "@/lib/supabase";
import { IoTrashBin } from "react-icons/io5";
import LoadingAnimation from "@/app/components/utils/loading";
import toast, {Toaster} from "react-hot-toast";
import Image from "next/image";

export default function Page() {
    const [events, setEvents] = React.useState<Event[]>(null);
    const [adminSignedIn, setAdminSignedIn] = React.useState(false);

    useEffect(() => {
        supabase.from("Event").select("*").returns<Event[]>().then((response) =>
        {
            response.data.forEach((event) => {
                if(event.date)
                    event.date = new Date(event.date);
                if(event.image)
                    event.imageUrl = getEventImageUrl(event);
            });
            setEvents(response.data ?? []);
        });
        supabase.auth.getUser().then((response) =>
        {
            if(response.data.user != null)
            {
                setAdminSignedIn(true);
            }
        });
    }, []);

    const deleteEvent = async (id) =>
    {
        const event = events.find((event) => event.id == id);
        if(event.image != null)
        {
            await supabase.storage.from("event_images").remove([event.image]);
        }

        const response = await supabase.from("Event").delete().match({id: id});
        if(response.error != null)
        {
            toast.error("Failed to delete event");
        }else
        {
            toast.success("Successfully deleted event");
            setEvents(events.filter((event) => event.id != id));
        }
    };

    supabase.storage.from("event_images").getPublicUrl("test.jpg");
    return <>
        <div className="container mx-auto min-h-[54.65vh] w-full">
            {
                !events ?
                    <div className="text-center w-full pt-20 flex justify-center">
                        <LoadingAnimation/>
                    </div>
                    :
                    events.length > 0 ?
                        <div className="flex flex-col justify-start items-center">
                            <h1 className="text-3xl font-bold mt-10">Upcoming Events</h1>
                            <div className="flex flex-row gap-10 flex-wrap m-10">
                                {events.map((event) =>
                                        // eslint-disable-next-line react/jsx-key
                                        <div id={titleToId(event.title)}>
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
                                                                    <Button variant="plain" color="danger" size="sm" onClick={() => deleteEvent(event.id)}>
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
                                                <Divider orientation="vertical" />
                                                <Typography level="body-xs" fontWeight="sm" textColor="text.secondary">
                                                    Time
                                                </Typography>
                                                <Typography level="body-xs" fontWeight="md" textColor="text.secondary">
                                                    {formatTime(event.date)}
                                                </Typography>
                                            </CardContent>
                                        </CardOverflow>}
                                    </Card>
                            </div>
                            )}
                        </div>
                    </div>
                    :
                    <div className="h-[54.65vh] flex justify-center items-center w-full text-center">
                        <h1 className="text-gray-300 text-3xl font-semibold">No Upcoming Events</h1>
                    </div>
            }
        </div>
        <Toaster position={"top-center"}/>
    </>;
}

function getEventImageUrl(event : Event) : string
{
    const response = supabase.storage.from("event_images").getPublicUrl(event.image);
    return response.data.publicUrl;
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