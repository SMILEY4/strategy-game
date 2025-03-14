import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";
import {LocalStateHooks} from "../../../../../state/access/localStateHooks";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";

export namespace UseMoveWindow {

	/**
	 * Opens the move world-object window
	 */
	export function open(worldObjectId: WorldObjectId) {
		const WINDOW_ID = "move-command";
		openWindow({
			id: WINDOW_ID,
			anchor: WindowStore.ANCHOR_BOTTOM_POINT,
			blockOthers: true,
			content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
		});
	}

	/**
	 * The data and functions required by the window
	 */
	export interface Data {
		remainingPoints: number,
		totalPoints: number
		cancel: () => void,
		accept: () => void
	}

	/**
	 * Provides the data and functions required by the window
	 */
	export function useData(windowId: string, worldObjectId: WorldObjectId | null): UseMoveWindow.Data | null {

        const remainingMovement = LocalStateHooks.useRemainingMovementPoints()
        const closeWindow = useCloseWindow();

        useEffect(() => {
			if (worldObjectId) INTERFACE_SERVICE.beginMovement(worldObjectId)
		}, []);

		if (worldObjectId) {
			return {
				remainingPoints: remainingMovement,
				totalPoints: INTERFACE_SERVICE.getTotalMovement(),
				cancel: () => {
					INTERFACE_SERVICE.endMovement(false);
					closeWindow(windowId);
				},
				accept: () => {
                    INTERFACE_SERVICE.endMovement(true);
					closeWindow(windowId);
				},
			};
		} else {
			return null;
		}
	}

}