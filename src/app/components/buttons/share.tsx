"use client"
import React, {useState} from "react";
import {
    EmailIcon,
    EmailShareButton,
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import toast from "react-hot-toast";
import {Button, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Tooltip} from "@mui/joy";
import {FaShareAlt} from "react-icons/fa";
import { Transition } from 'react-transition-group';
import {useIsClient} from "@/lib/utils/useIsClient";

export default function ShareButton(props: {title: string, url: string})
{
    const [isShareOpen, setIsShareOpen] = useState(false);
    // Read from the browser only once mounted: touching window during render
    // throws if this component is ever rendered on the server.
    const isClient = useIsClient();
    const url = (isClient ? window.location.origin : "") + props.url;

    const copyUrl = () =>
    {
        navigator.clipboard?.writeText(url).then(() =>
        {
            toast.success("Copied URL to clipboard");
        })
        .catch(() =>
        {
            // Denied permission, or an insecure context.
            toast.error("Couldn't copy automatically — please copy the link manually");
        });
    };

    return <>
        <Tooltip title="Share">
            <Button variant="plain" size="sm" onClick={() => setIsShareOpen(true)}>
                <FaShareAlt/>
            </Button>
        </Tooltip>
        <Transition in={isShareOpen} timeout={400}>
            {(state: string) =>
                <Modal
                    keepMounted
                    open={!['exited', 'exiting'].includes(state)}
                    onClose={() => setIsShareOpen(false)}
                    slotProps={{
                        backdrop: {
                            sx: {
                                opacity: 0,
                                backdropFilter: 'none',
                                transition: `opacity 400ms, backdrop-filter 400ms`,
                                ...{
                                    entering: { opacity: 1, backdropFilter: 'blur(8px)' },
                                    entered: { opacity: 1, backdropFilter: 'blur(8px)' },
                                }[state],
                            },
                        },
                    }}
                    sx={{
                        visibility: state === 'exited' ? 'hidden' : 'visible',
                    }}>
                    <ModalDialog
                        className="!bg-bg-100 !text-text-100 !border-bg-300"
                        sx={{
                            opacity: 0,
                            transition: `opacity 300ms`,
                            ...{
                                entering: { opacity: 1 },
                                entered: { opacity: 1 },
                            }[state],
                        }}>
                        <ModalClose className="!text-text-200 hover:!bg-bg-200" sx={{mt: 1, mr: 1}}/>
                        <DialogTitle level="h3" className="!text-text-100 !font-default">Share</DialogTitle>
                        <DialogContent>
                            <div className="flex flex-col gap-4 w-full h-full">
                                <div className="flex flex-row gap-3 justify-start items-center flex-wrap">
                                    <WhatsappShareButton url={url} title={props.title}>
                                        <WhatsappIcon size={40} round/>
                                    </WhatsappShareButton>
                                    <FacebookShareButton url={url}>
                                        <FacebookIcon size={40} round/>
                                    </FacebookShareButton>
                                    <TelegramShareButton url={url} title={props.title}>
                                        <TelegramIcon size={40} round/>
                                    </TelegramShareButton>
                                    <EmailShareButton url={url} subject={props.title} body={props.title + "\n\n"}>
                                        <EmailIcon size={40} round/>
                                    </EmailShareButton>
                                </div>
                                <div className="flex flex-row gap-2 justify-start items-center flex-wrap">
                                    <div className="py-2 px-4 border border-bg-300 rounded-md text-sm bg-bg-200 text-text-100 break-all">
                                        <p>{url}</p>
                                    </div>
                                    <button onClick={copyUrl} className="rounded-md flex flex-row items-center gap-2 px-4 py-2 bg-accent-100 hover:brightness-110 text-white text-md transition duration-150 ease-out">
                                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                            <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"/>
                                            <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"/>
                                        </svg>
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </ModalDialog>
                </Modal>
            }
        </Transition>
    </>;
}