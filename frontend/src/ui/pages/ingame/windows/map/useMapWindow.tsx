import React from "react";
import {MapWindow} from "./MapWindow";
import {MapMode} from "../../../../../models/base/mapMode";
import {SessionRepository} from "../../../../../state/repository/sessionRepository";
import {useDI} from "../../../../../appContext";
import {MapService} from "../../../../../logic/game/mapService";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseMapWindow {

    /**
     * Returns a function to open the map modes window
     */
    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return () => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <MapWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    /**
     * The data and functions required by the window
     */
    export interface Data {
        selectedMapMode: MapMode,
        setMapMode: (mapMode: MapMode) => void
    }

    /**
     * Provides the data and functions required by the window
     */
    export function useData(): UseMapWindow.Data {
        const mapMode = SessionRepository.useMapMode();
        const setMapMode = useSetMapMode();
        return {
            selectedMapMode: mapMode,
            setMapMode: setMapMode,
        };
    }

    /**
     * Returns a function to set the selected map mode
     */
    function useSetMapMode(): (mode: MapMode) => void {
        const service = useDI<MapService>(MapService.name);
        return (mode: MapMode) => service.setMapMode(mode);
    }

}