import {TileSummary} from "../../../../../models/tile/tileSummary";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UID} from "../../../../../common/uid";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementCreateWindow} from "./SettlementCreateWindow";
import {useEffect, useState} from "react";
import {App} from "../../../../../appContext";

export namespace UseSettlementCreateWindow {

	export function open(tile: TileSummary, worldObjectId: WorldObject.Id) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			blockOthers: true,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			content: <SettlementCreateWindow windowId={windowId} tile={tile} worldObjectId={worldObjectId}/>,
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
	 * Provides the data and functions required by the window
	 */
	export function useData(windowId: string, tile: TileSummary, worldObjectId: WorldObject.Id): UseSettlementCreateWindow.Data {

		const closeWindow = useCloseWindow();

		const [name, setName] = useState("");
		const [invalidReasons, setInvalidReasons] = useState<string[]>([]);

		useEffect(() => {
			App.gameProxy.getRandomSettlementName().then(setName);
			App.gameProxy.beginCreateSettlement(worldObjectId);
		}, []);

		useEffect(() => {
			setInvalidReasons(App.gameProxy.validateCreateSettlement(tile.id, worldObjectId, name));
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
			randomizeName: () => App.gameProxy.getRandomSettlementName().then(setName),
			cancel: () => {
				App.gameProxy.cancelCreateSettlement();
				closeWindow(windowId)
			},
			create: () => {
				App.gameProxy.createSettlement(tile, worldObjectId, name);
				closeWindow(windowId);
			},
		};
	}
}