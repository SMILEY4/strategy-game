import {Tile, TileIdentifier, TileObject} from "../../../../../models/base/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseTileWindow {

	export function open(identifier: TileIdentifier | null) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <TileWindow windowId={windowId} identifier={identifier}/>,
		});
	}

	export interface Data {
		tile: Tile;
		open: {
			controllingSettlement: () => void,
			tileObject: (tileObject: TileObject) => void,
		};
		centerCamera: () => void,
	}

	export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

		const selectedTileId = LocalStateHooks.useSelectedTileId();
		const tile = LocalStateHooks.useTile((overwriteTile ?? selectedTileId) ?? null);

		if (tile) {
			return {
				tile: tile,
				open: {
					controllingSettlement: () => {
						if (tile.political.value?.controlledBy?.settlement) {
							UseSettlementWindow.open(tile.political.value?.controlledBy?.settlement!);
						}
					},
					tileObject: (tileObject) => {
						if (tileObject.worldObject !== null) {
							UseWorldObjectWindow.open(tileObject.worldObject);
						}
						if (tileObject.settlement !== null) {
							UseSettlementWindow.open(tileObject.settlement);
						}
					},
				},
				centerCamera: () => INTERFACE_SERVICE.focusCamera(tile.identifier),
			};
		} else {
			return null;
		}
	}

}