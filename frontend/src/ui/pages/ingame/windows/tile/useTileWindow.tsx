import {Tile, TileIdentifier} from "../../../../../models/base/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseTileWindow {

	export function useOpen() {
		const WINDOW_ID = "menubar-window";
		const open = useOpenWindow();
		return (identifier: TileIdentifier | null) => {
			open({
				id: WINDOW_ID,
				anchor: WindowStore.ANCHOR_LEFT_EDGE,
				content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
			});
		};
	}

	export function open(identifier: TileIdentifier | null) {
		const WINDOW_ID = "menubar-window";
		openWindow({
			id: WINDOW_ID,
			anchor: WindowStore.ANCHOR_LEFT_EDGE,
			content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
		});
	}

	export interface Data {
		tile: Tile;
	}

	export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

		const selectedTileIdentifier = TileRepository.useSelected();
		const tile = TileRepository.useById((overwriteTile ?? selectedTileIdentifier) ?? null);

		if (tile) {
			return {
				tile: tile,
			};
		} else {
			return null;
		}
	}

}