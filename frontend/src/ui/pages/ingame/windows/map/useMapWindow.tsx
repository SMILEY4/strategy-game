import React from "react";
import {MapWindow} from "./MapWindow";
import {MapMode} from "../../../../../models/misc/mapMode";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {LocalStateHooks} from "../../../../../state/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseMapWindow {

	export function open() {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <MapWindow windowId={windowId}/>,
		});
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
		return {
			selectedMapMode: LocalStateHooks.useMapMode(),
			setMapMode: INTERFACE_SERVICE.selectMapMode,
		};
	}

}