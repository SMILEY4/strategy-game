import React from "react";
import {UnitWindow} from "./UnitWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {UseMoveWindow} from "../move/useMoveWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";
import {Command, DisbandCommand, MoveCommand} from "../../../../../models/command/command";
import {CommandType} from "../../../../../models/command/commandType";

export namespace UseUnitWindow {

	export function open(worldObjectId: WorldObjectId | null) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <UnitWindow windowId={windowId} identifier={worldObjectId}/>,
		});
	}

	export interface Data {
		worldObject: WorldObject;
		actions: UnitAction[],
		open: {
			tile: () => void
		}
		centerCamera: () => void,
	}

	export interface UnitAction {
		type: "cancel-current-command" | "move" | "disband"
	}

	export interface UnitCancelCurrentCommandAction extends UnitAction {
		type: "cancel-current-command"
		enabled: boolean,
		perform: () => void,
	}

	export interface UnitMoveAction extends UnitAction {
		type: "move"
		enabled: boolean,
		perform: () => void,
	}

	export interface UnitDisbandAction extends UnitAction {
		type: "disband"
		enabled: boolean,
		perform: () => void,
	}

	export function useData(worldObjectId: WorldObjectId | null): Data | null {

		const worldObject = GameStateHooks.useWorldObject(worldObjectId);
		const commands = GameStateHooks.useCommands()

		if (worldObject) {
			return {
				worldObject: worldObject,
				actions: collectActions(worldObject, commands),
				open: {
					tile: () => UseTileWindow.open(worldObject.tile.id ?? null),
				},
				centerCamera: () => App.gameProxy.focusCamera(worldObject.tile.position),
			};
		} else {
			return null;
		}
	}

	function collectActions(worldObject: WorldObject, commands: Command[]): UnitAction[] {
		const actions: UnitAction[] = [];

		const relevantCommands = commands.filter(it => {
			if(it.type === CommandType.WORLD_OBJECT_MOVE) {
				const cmdMove = it as MoveCommand
				return cmdMove.worldObjectId === worldObject.id
			}
			if(it.type === CommandType.WORLD_OBJECT_DISBAND) {
				const cmdDisband = it as DisbandCommand
				return cmdDisband.worldObjectId === worldObject.id
			}
			return false;
		})

		// move
		if(worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, "movement")){
			actions.push({
				type: "move",
				enabled: relevantCommands.length == 0,
				perform: () => UseMoveWindow.open(worldObject.id)
			} as UnitMoveAction)
		}

		// disband
		if(worldObject.realm.ownedByUser) {
			actions.push({
				type: "disband",
				enabled: relevantCommands.length == 0,
				perform: () => App.gameProxy.disbandWorldObject(worldObject.id),
			} as UnitDisbandAction)
		}


		// cancel current command
		if(worldObject.realm.ownedByUser) {
			actions.push({
				type: "cancel-current-command",
				enabled: relevantCommands.length > 0,
				perform: () => relevantCommands.forEach(it => App.gameProxy.commandCancel(it)),
			} as UnitCancelCurrentCommandAction)
		}

		return actions
	}

}