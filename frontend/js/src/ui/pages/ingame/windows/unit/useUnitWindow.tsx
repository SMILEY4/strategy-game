import React from "react";
import {UnitWindow} from "./UnitWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {UseMoveWindow} from "../move/useMoveWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";
import {Command} from "../../../../../models/command/command";
import {
	UseTileImprovementConstructionWindow
} from "../tileimprovementconstruction/useTileImprovementConstructionWindow";

export namespace UseUnitWindow {

	export function open(worldObjectId: WorldObject.Id | null) {
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

	export type UnitAction = UnitCancelCurrentCommandAction
		| UnitMoveAction
		| ConstructTileImprovementAction
		| SpawnSettlementAction
		| UnitDisbandAction

	export interface UnitCancelCurrentCommandAction {
		type: "cancel-current-command"
		enabled: boolean,
		perform: () => void,
	}

	export interface UnitMoveAction {
		type: "move"
		enabled: boolean,
		perform: () => void,
	}

	export interface ConstructTileImprovementAction {
		type: "construct-tile-improvement"
		enabled: boolean,
		perform: () => void,
	}

	export interface SpawnSettlementAction {
		type: "spawn-settlement"
		enabled: boolean,
		perform: () => void,
	}

	export interface UnitDisbandAction {
		type: "disband"
		enabled: boolean,
		perform: () => void,
	}

	export function useData(worldObjectId: WorldObject.Id | null): Data | null {

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

		const relevantCommands = commands.filter(cmd => {
			if(cmd.type === Command.Type.Move) {
				return cmd.worldObjectId === worldObject.id
			}
			if(cmd.type === Command.Type.Disband) {
				return cmd.worldObjectId === worldObject.id
			}
			if(cmd.type === Command.Type.ConstructTileImprovement) {
				return cmd.worldObjectId === worldObject.id
			}
			return false;
		})

		// move
		if(worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.Movement)){
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

		// construct tile improvement
		if(worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.Builder)) {
			actions.push({
				type: "construct-tile-improvement",
				enabled: relevantCommands.length == 0,
				perform: () => UseTileImprovementConstructionWindow.open(worldObject.id),
			} as ConstructTileImprovementAction)
		}

		// spawn settlement
		if(worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.SettlementSpawner)) {
			actions.push({
				type: "spawn-settlement",
				enabled: relevantCommands.length == 0,
				perform: () => undefined,
			} as SpawnSettlementAction)
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