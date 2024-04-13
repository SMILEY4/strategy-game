import {useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {TileIdentifier} from "../../../../../models/tile";
import React, {useState} from "react";
import {PlaceMarkerWindow} from "./PlaceMarkerWindow";
import {AppCtx} from "../../../../../appContext";

export namespace UsePlaceMarkerWindow {


    export function useOpen() {
        const WINDOW_ID = "place-marker-window";
        const addWindow = useOpenWindow();
        return (tile: TileIdentifier) => {
            addWindow({
                id: WINDOW_ID,
                className: "place-marker-window",
                left: 125,
                top: 160,
                width: 360,
                height: 170,
                content: <PlaceMarkerWindow windowId={WINDOW_ID} tile={tile}/>,
            });
        };
    }

    export interface Data {
        input: {
            label: string,
            setLabel: (value: string) => void
        };
        cancel: () => void;
        create: () => void;
    }

    export function useData(windowId: string, tileIdentifier: TileIdentifier): UsePlaceMarkerWindow.Data {

        const [label, setLabel] = useState("");
        const closeWindow = useCloseWindow();

        return {
            input: {
                label: label,
                setLabel: setLabel
            },
            cancel: () => closeWindow(windowId),
            create: () => {
                AppCtx.MarkerService().placeMarker(tileIdentifier, label)
                closeWindow(windowId);
            },
        };
    }



}