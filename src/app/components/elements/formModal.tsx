"use client"
import {DialogContent, DialogTitle, Modal, ModalClose, ModalDialog} from "@mui/joy";
import {ReactNode} from "react";
import LoadingAnimation from "@/app/components/elements/loading";
import {Size} from "@/lib/utils/size";

/**
 * Shared shell for the admin dialogs. MUI Joy's modal renders in its own
 * (light) theme context, so the surface colours are pinned to the site's CSS
 * variables here instead of being restyled in each dialog.
 */
export default function FormModal(props: {
    open: boolean,
    title: string,
    description?: string,
    loading?: boolean,
    loadingText?: string,
    /** Roomier dialog, for content like a review table. */
    wide?: boolean,
    onClose: () => void,
    children: ReactNode
})
{
    // While something is uploading, closing would leave the work half-done with
    // no way to observe it, so backdrop/escape/close are all inert.
    const requestClose = () =>
    {
        if(!props.loading)
            props.onClose();
    };

    // The entrance animation is opacity-only on purpose: Joy centres the dialog
    // with a translate(-50%, -50%), so any transform-based animation applied
    // here (a scale, say) overwrites that transform and knocks the modal
    // off-centre.
    return <Modal open={props.open} onClose={requestClose}>
        <ModalDialog
            className="!bg-bg-100 !text-text-100 !border-bg-300 animate-fade-in"
            sx={{
                width: props.wide ? "min(94vw, 46rem)" : "min(92vw, 30rem)",
                maxHeight: "88vh",
                borderRadius: "12px",
                overflow: "hidden",
                gap: 0.5
            }}>
            {!props.loading && <ModalClose className="!text-text-200 hover:!bg-bg-200"/>}
            <DialogTitle className="!text-text-100 !font-default !text-xl">{props.title}</DialogTitle>
            {props.description &&
                <p className="text-sm text-text-200 opacity-80 pr-8">{props.description}</p>}
            <DialogContent sx={{ overflowY: "auto", pt: 1.5 }}>
                {props.children}
            </DialogContent>
            <LoadingAnimation state={props.loading} text={props.loadingText} size={Size.M}/>
        </ModalDialog>
    </Modal>
}
