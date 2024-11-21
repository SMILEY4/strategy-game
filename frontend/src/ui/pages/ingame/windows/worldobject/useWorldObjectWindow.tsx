import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {useDI} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/base/worldObject";
import {UseMoveWindow} from "../move/useWorldObjectWindow";
import {CommandType, MoveCommand} from "../../../../../models/base/command";
import {UseFoundSettlementWindow} from "../foundsettlement/useFoundSettlementWindow";
import {WorldObjectType} from "../../../../../models/base/worldObjectType";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {CommandService} from "../../../../../logic/game/commandService";
import {MovementService} from "../../../../../logic/game/movementService";

export namespace UseWorldObjectWindow {

	export function useOpen() {
		const WINDOW_ID = "menubar-window";
		const openWindow = useOpenWindow();
		return (identifier: string | null) => {
			openWindow({
				id: WINDOW_ID,
				className: "worldobject-window",
				left: 25,
				top: 60,
				bottom: 25,
				width: 360,
				content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
			});
		};
	}

	export function open(identifier: string | null) {
		const WINDOW_ID = "menubar-window";
		openWindow({
			id: WINDOW_ID,
			className: "worldobject-window",
			left: 25,
			top: 60,
			bottom: 25,
			width: 360,
			content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
		});
	}

	export interface Data {
		worldObject: WorldObject;
		movement: {
			possible: boolean,
			enabled: boolean,
			canCancel: boolean,
			start: () => void,
			cancel: () => void
		};
		settlement: {
			possible: boolean
			enabled: boolean,
			start: () => void,
		};
	}

	export function useData(identifier: string | null): UseWorldObjectWindow.Data | null {

		const worldObject = WorldObjectRepository.useById(identifier);
		const tile = TileRepository.useById(worldObject?.tile);

		const hasCommand = CommandRepository.useAll().some(it => it.worldObjectId === identifier);
		const hasMoveCommand = CommandRepository.useAllByType<MoveCommand>(CommandType.MOVE).some(it => it.worldObjectId === identifier);

		const openMoveWindow = UseMoveWindow.useOpen();
		const openFoundSettlementWindow = UseFoundSettlementWindow.useOpen();

		if (worldObject) {
			return {
				worldObject: worldObject,
				movement: {
					possible: worldObject.ownedByPlayer,
					enabled: !hasCommand,
					canCancel: hasMoveCommand,
					start: () => identifier && openMoveWindow(worldObject.id),
					cancel: () => cancelMovementCommand(worldObject),
				},
				settlement: {
					possible: worldObject.ownedByPlayer && worldObject.type === WorldObjectType.SETTLER,
					enabled: !hasCommand && tile?.createSettlement.settler!,
					start: () => openFoundSettlementWindow(worldObject.tile, worldObject.id),
				},
			};
		} else {
			return null;
		}
	}

	function cancelMovementCommand(worldObject: WorldObject) {
		const movementService = useDI<MovementService>(MovementService.name);
		movementService.cancelMovementCommand(worldObject)
	}

}