import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {LocalStateHooks} from "../../../../../state/localStateHooks";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";
import {App} from "../../../../../appContext";

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
	export function useData(windowId: string, worldObjectId: WorldObjectId): UseMoveWindow.Data | null {

		const worldObject = LocalStateHooks.useWorldObject(worldObjectId)
        const remainingMovement = LocalStateHooks.useRemainingMovementPoints()
        const closeWindow = useCloseWindow();

        useEffect(() => {
			if (worldObjectId) App.interfaceService.beginMovement(worldObjectId)
		}, []);

		if (worldObject) {
			return {
				remainingPoints: remainingMovement,
				totalPoints: worldObject.maxMovementPoints,
				cancel: () => {
					App.interfaceService.endMovement(false);
					closeWindow(windowId);
				},
				accept: () => {
					App.interfaceService.endMovement(true);
					closeWindow(windowId);
				},
			};
		} else {
			return null;
		}
	}

}