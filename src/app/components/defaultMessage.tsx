import React from "react";

export function DefaultMessage(props: {message: string}) {
    return <div className="h-[54.65vh] flex justify-center items-center w-full text-center">
        <h1 className="text-gray-300 text-3xl font-semibold">{props.message}</h1>
    </div>
}