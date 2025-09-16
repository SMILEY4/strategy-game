import React from "react";
import {TileWindow} from "./TileWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {TileId} from "../../../../../models/tile/tileId";
import {Tile} from "../../../../../models/tile/tile";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";

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
			worldObject: (worldObjectId: WorldObjectId) => void,
		};
		centerCamera: () => void,
	}

	export function useData(overwriteTile: TileId | null): UseTileWindow.Data | null {

		const selectedTile = GameStateHooks.useSelectedTile();
		const tile = GameStateHooks.useTile((overwriteTile ?? selectedTile?.id) ?? null);

		if (tile) {
			return {
				tile: tile,
				open: {
					worldObject: worldObjectId => UseWorldObjectWindow.open(worldObjectId)
				},
				centerCamera: () => App.gameProxy.focusCamera(tile.position),
			};
		} else {
			return null;
		}
	}

}