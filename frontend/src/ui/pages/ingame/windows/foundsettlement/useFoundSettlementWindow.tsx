import {FoundSettlementWindow} from "./FoundSettlementWindow";
import {useEffect, useState} from "react";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";
import {TileSummary} from "../../../../../models/tile/tileSummary";
import {App} from "../../../../../appContext";

export namespace UseFoundSettlementWindow {

	export function open(tile: TileSummary, worldObjectId: WorldObjectId) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			content: <FoundSettlementWindow windowId={windowId} tile={tile} worldObjectId={worldObjectId}/>,
		});
	}

	/**
	 * The data and functions required by the "found settlement" window
	 */
	export interface Data {
		input: {
			valid: boolean,
			reasonsInvalid: string[]
			name: {
				value: string,
				set: (value: string) => void
			}
		};
		randomizeName: () => void;
		cancel: () => void;
		create: () => void;
	}

	/**
	 * Provides the data and functions required by the "found settlement" window
	 */
	export function useData(windowId: string, tile: TileSummary, worldObjectId: WorldObjectId): UseFoundSettlementWindow.Data {

		const closeWindow = useCloseWindow();

		const [name, setName] = useState("");
		const [invalidReasons, setInvalidReasons] = useState<string[]>([]);

		useEffect(() => {
			App.interfaceService.getRandomSettlementName().then(setName);
		}, []);

		useEffect(() => {
			setInvalidReasons(App.interfaceService.validateFoundSettlement(tile.id, name));
		}, [name]);

		return {
			input: {
				valid: invalidReasons.length === 0,
				reasonsInvalid: invalidReasons,
				name: {
					value: name,
					set: setName,
				},
			},
			randomizeName: () => App.interfaceService.getRandomSettlementName().then(setName),
			cancel: () => closeWindow(windowId),
			create: () => {
				App.interfaceService.foundSettlement(tile, worldObjectId, name);
				closeWindow(windowId);
			},
		};
	}
}