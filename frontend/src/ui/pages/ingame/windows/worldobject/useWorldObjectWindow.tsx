import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {WorldObjectType} from "../../../../../models/worldobject/worldObjectType";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {UseMoveWindow} from "../move/useMoveWindow";
import {UseFoundSettlementWindow} from "../foundsettlement/useFoundSettlementWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {CommandType} from "../../../../../models/command/commandType";
import {Command, CreateSettlementCommand, MoveCommand} from "../../../../../models/command/command";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";

export namespace UseWorldObjectWindow {

	export function open(worldObjectId: WorldObjectId | null) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <WorldObjectWindow windowId={windowId} identifier={worldObjectId}/>,
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
		open: {
			tile: () => void
		}
		centerCamera: () => void,
	}

	export function useData(worldObjectId: WorldObjectId | null): UseWorldObjectWindow.Data | null {

		const worldObject = GameStateHooks.useWorldObject(worldObjectId);
		const tile = GameStateHooks.useTile(worldObject?.tile?.id ?? null);

		const commands = GameStateHooks.useCommands().filter(cmd => isRelevantCommand(worldObjectId, cmd));
		const hasCommand = commands.length > 0;
		const moveCommand = commands.find(cmd => cmd.type === CommandType.MOVE);

		if (worldObject) {
			return {
				worldObject: worldObject,
				movement: {
					possible: worldObject.country.isUserControlled,
					enabled: !hasCommand,
					canCancel: !!moveCommand,
					start: () => worldObjectId && UseMoveWindow.open(worldObject.id),
					cancel: () => moveCommand && App.gameProxy.commandCancel(moveCommand),
				},
				settlement: {
					possible: worldObject.country.isUserControlled && worldObject.type === WorldObjectType.SETTLER,
					enabled: !hasCommand && (tile?.isValidSettlementLocation ?? false),
					start: () => UseFoundSettlementWindow.open(worldObject.tile, worldObject.id),
				},
				open: {
					tile: () => UseTileWindow.open(worldObject.tile.id ?? null),
				},
				centerCamera: () => App.gameProxy.focusCamera(worldObject.tile.position),
			};
		} else {
			return null;
		}
	}

	function isRelevantCommand(worldObjectId: WorldObjectId | null, command: Command): boolean {
		if (command.type === CommandType.MOVE) {
			return worldObjectId === (command as MoveCommand).worldObjectId;
		}
		if (command.type === CommandType.CREATE_SETTLEMENT) {
			return worldObjectId === (command as CreateSettlementCommand).worldObjectId;
		}
		return false;
	}

}