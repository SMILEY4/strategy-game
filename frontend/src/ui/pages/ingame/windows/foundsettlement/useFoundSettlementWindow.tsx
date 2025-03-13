import {TileIdentifier} from "../../../../../models/base/tile";
import {FoundSettlementWindow} from "./FoundSettlementWindow";
import {useEffect, useState} from "react";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseFoundSettlementWindow {

	export function open(tile: TileIdentifier, worldObjectId: string) {
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
	export function useData(windowId: string, tileIdentifier: TileIdentifier, worldObjectId: string): UseFoundSettlementWindow.Data {

        const closeWindow = useCloseWindow();

		const [name, setName] = useState("");
		const [invalidReasons, setInvalidReasons] = useState<string[]>([]);

		useEffect(() => {
			INTERFACE_SERVICE.getRandomSettlementName().then(setName);
		}, []);

		useEffect(() => {
			setInvalidReasons(INTERFACE_SERVICE.validateFoundSettlement(tileIdentifier, name));
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
			randomizeName: () => INTERFACE_SERVICE.getRandomSettlementName().then(setName),
			cancel: () => closeWindow(windowId),
			create: () => {
				INTERFACE_SERVICE.foundSettlement(tileIdentifier, worldObjectId, name);
                closeWindow(windowId);
			},
		};
	}
}