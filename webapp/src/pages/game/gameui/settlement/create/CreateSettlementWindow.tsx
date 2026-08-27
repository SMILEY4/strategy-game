import type {ReactElement} from "react";
import {SimpleWindow} from "@modules/uicomponents/window/simple/SimpleWindow.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {openWindow} from "@modules/uicomponents/window/useWindow.ts";
import {ANCHOR_CENTER_POINT} from "@modules/uicomponents/window/window-system.ts";


export function openWindowCreateSettlement(): string {
    const windowId = crypto.randomUUID();
    openWindow({
        id: windowId,
        anchor: ANCHOR_CENTER_POINT,
        content: windowId => (
            <CreateSettlementWindow windowId={windowId}/>
        )
    })
    return windowId;
}

interface CreateSettlementWindowProps {
    windowId: string
}

export function CreateSettlementWindow(props: CreateSettlementWindowProps): ReactElement {

    const { windowId} = props

    return (
        <SimpleWindow windowId={windowId} title={"Test Window"} withCloseButton={true}>
            <Txt.Line><Txt.String>{windowId}</Txt.String></Txt.Line>
        </SimpleWindow>
    )
}