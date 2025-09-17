import React from "react";
import {TileWindow} from "./TileWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Tile} from "../../../../../models/tile/tile";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {UseUnitWindow} from "../unit/useUnitWindow";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {WorldObjectSummary} from "../../../../../models/worldobject/worldObjectSummary";

export namespace UseTileWindow {

	export function open(identifier: Tile.Id | null) {
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
		worldObjects: WorldObjectSummary[];
		open: {
			worldObject: (worldObjectId: WorldObject.Id) => void,
		};
		centerCamera: () => void,
	}

	export function useData(overwriteTile: Tile.Id | null): UseTileWindow.Data | null {

		const selectedTile = GameStateHooks.useSelectedTile();
		const tile = GameStateHooks.useTile((overwriteTile ?? selectedTile?.id) ?? null);
		const worldObjects = GameStateHooks.useWorldObjectAt(tile?.position ?? null)

		if (tile) {
			return {
				tile: tile,
				worldObjects: worldObjects,
				open: {
					worldObject: worldObjectId => UseUnitWindow.open(worldObjectId)
				},
				centerCamera: () => App.gameProxy.focusCamera(tile.position),
			};
		} else {
			return null;
		}
	}

}