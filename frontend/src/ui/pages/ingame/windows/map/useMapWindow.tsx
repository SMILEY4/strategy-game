import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {MapWindow} from "./MapWindow";
import {MapMode} from "../../../../../models/mapMode";
import {GameSessionDatabase} from "../../../../../state/database/gameSessionDatabase";

export namespace UseMapWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const addWindow = useOpenWindow();
        return () => {
            addWindow({
                id: WINDOW_ID,
                className: "map-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 360,
                content: <MapWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    export interface Data {
        selectedMapMode: MapMode,
        setMapMode: (mapMode: MapMode) => void
    }

    export function useData(): UseMapWindow.Data {
        const [selectedMapMode, setMapMode] = GameSessionDatabase.useMapMode();
        return {
            selectedMapMode: selectedMapMode,
            setMapMode: setMapMode,
        };
    }

}