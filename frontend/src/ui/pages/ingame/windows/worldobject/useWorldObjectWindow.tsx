import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {AppCtx} from "../../../../../appContext";
import {TileDatabase} from "../../../../../state/database/tileDatabase";
import {GameSessionDatabase} from "../../../../../state/database/gameSessionDatabase";
import {WorldObject} from "../../../../../models/worldObject";
import {WorldObjectDatabase} from "../../../../../state/database/objectDatabase";
import {UseMoveWindow} from "../move/useWorldObjectWindow";

export namespace UseWorldObjectWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const openWindow = useOpenWindow();
        return (identifier: string | null) => {
            openWindow({
                id: WINDOW_ID,
                className: "worldobject-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 360,
                content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: string | null) {
        const WINDOW_ID = "menubar-window";
        openWindow({
            id: WINDOW_ID,
            className: "worldobject-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
        });
    }

    export interface Data {
        worldObject: WorldObject;
        startMoveCommand: () => void;
    }

    export function useData(identifier: string | null): UseWorldObjectWindow.Data | null {

        const worldObject = AppCtx.WorldObjectDatabase().querySingle(WorldObjectDatabase.QUERY_BY_ID, identifier);

        const openMoveWindow = UseMoveWindow.useOpen()

        if (worldObject) {
            return {
                worldObject: worldObject,
                startMoveCommand: () => identifier && openMoveWindow(identifier),
            };
        } else {
            return null;
        }
    }

}