import React from "react";
import {TileWindow} from "./TileWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {LocalStateHooks} from "../../../../../state/localStateHooks";
import {TileId} from "../../../../../models/tile/tileId";
import {Tile} from "../../../../../models/tile/tile";
import {TileObject} from "../../../../../models/tile/tileObject";
import {App} from "../../../../../appContext";

export namespace UseTileWindow {

	export function open(identifier: TileId | null) {
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

	export function useData(overwriteTile: TileId | null): UseTileWindow.Data | null {

		const selectedTile = LocalStateHooks.useSelectedTile();
		const tile = LocalStateHooks.useTile((overwriteTile ?? selectedTile?.id) ?? null);

		if (tile) {
			return {
				tile: tile,
				open: {
					controllingSettlement: () => {
						if (tile.political.value?.controlledBy?.settlement) {
							UseSettlementWindow.open(tile.political.value?.controlledBy?.settlement!.id);
						}
					},
					tileObject: (tileObject) => {
						if (tileObject.worldObject !== null) {
							UseWorldObjectWindow.open(tileObject.worldObject.id);
						}
						if (tileObject.settlement !== null) {
							UseSettlementWindow.open(tileObject.settlement.id);
						}
					},
				},
				centerCamera: () => App.interfaceService.focusCamera(tile.position),
			};
		} else {
			return null;
		}
	}

}