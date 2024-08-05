import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {AppCtx} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/worldObject";
import {WorldObjectDatabase} from "../../../../../state/database/objectDatabase";
import {UseMoveWindow} from "../move/useWorldObjectWindow";
import {CommandType, MoveCommand} from "../../../../../models/command";
import {CommandDatabase} from "../../../../../state/database/commandDatabase";
import {useQueryMultiple, useQuerySingle} from "../../../../../shared/db/adapters/databaseHooks";

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
		}
	}

	export function useData(identifier: string | null): UseWorldObjectWindow.Data | null {

		const worldObject = useQuerySingle(AppCtx.WorldObjectDatabase(), WorldObjectDatabase.QUERY_BY_ID, identifier);

		const hasCommand = useQueryMultiple(AppCtx.CommandDatabase(), CommandDatabase.QUERY_ALL, null).some(it => it.worldObjectId === identifier);
		const hasMoveCommand = useQueryMultiple(AppCtx.CommandDatabase(), CommandDatabase.QUERY_ALL, null).some(it => it.type === CommandType.MOVE && (it as MoveCommand).worldObjectId === identifier);


		const openMoveWindow = UseMoveWindow.useOpen();

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
					possible: worldObject.ownedByPlayer,
					enabled: !hasCommand,
					start: () => foundSettlement(worldObject),
				}
			};
		} else {
			return null;
		}
	}

	function cancelMovementCommand(worldObject: WorldObject) {
		const command = AppCtx.CommandDatabase()
			.queryMany(CommandDatabase.QUERY_ALL, null)
			.find(it => it.type == CommandType.MOVE && (it as MoveCommand).worldObjectId === worldObject.id);
		if (command) {
			AppCtx.CommandService().cancelCommand(command.id);
		}
	}

	function foundSettlement(worldObject: WorldObject) {
		// todo
		console.log("Found settlement by " + worldObject.id + " at " + worldObject.tile.q + "," + worldObject.tile.r)
		AppCtx.CommandService().addFoundSettlementCommand(worldObject.id, worldObject.tile, worldObject.id)
	}

}