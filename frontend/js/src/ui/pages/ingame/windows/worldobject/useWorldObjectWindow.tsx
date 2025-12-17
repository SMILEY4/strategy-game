import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {UseMoveWindow} from "../move/useMoveWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";
import {Command} from "../../../../../models/command/command";
import {
	UseTileImprovementConstructionWindow,
} from "../tileimprovementconstruction/useTileImprovementConstructionWindow";
import {UseSettlementCreateWindow} from "../settlementcreate/useSettlementCreateWindow";
import {CameraService} from "../../../../../app/game/camera/camera.service";
import {CommandService} from "../../../../../app/game/command/command.service";
import {WorldObjectService} from "../../../../../app/game/worldobject/worldobject.service";
import {CommandStateAccess} from "../../../../../app/game/command/command.state-access";
import {WorldObjectStateAccess} from "../../../../../app/game/worldobject/worldobject.state-access";
import {WorldObjectDatabase} from "../../../../../app/database/worldObjectDatabase";
import {Db} from "../../../../../app/database";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";

export namespace UseWorldObjectWindow {

    export function open(worldObjectId: WorldObject.Id | null) {

        const entity = Db.worldObject.querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
        if(entity && entity.type.group === "settlement") {
            UseSettlementWindow.open(worldObjectId)
            return
        }

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
        actions: WorldObjectAction[],
        open: {
            tile: () => void
        }
        centerCamera: () => void,
    }

    export type WorldObjectAction = CancelCurrentCommandAction
        | MoveAction
        | ConstructTileImprovementAction
        | SpawnSettlementAction
        | DisbandAction

    export interface CancelCurrentCommandAction {
        type: "cancel-current-command"
        enabled: boolean,
        perform: () => void,
    }

    export interface MoveAction {
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

    export interface DisbandAction {
        type: "disband"
        enabled: boolean,
        perform: () => void,
    }

    export function useData(worldObjectId: WorldObject.Id | null): Data | null {

        const worldObject = WorldObjectStateAccess.useWorldObjectById(worldObjectId);
        const commands = CommandStateAccess.useCommands();

        if (worldObject) {
            return {
                worldObject: worldObject,
                actions: collectActions(worldObject, commands),
                open: {
                    tile: () => UseTileWindow.open(worldObject.tile.id ?? null),
                },
                centerCamera: () => CameraService.centerOnTile(worldObject.tile.position),
            };
        } else {
            return null;
        }
    }

    function collectActions(worldObject: WorldObject, commands: Command[]): WorldObjectAction[] {
        const actions: WorldObjectAction[] = [];

        const relevantCommands = commands.filter(cmd => {
            if (cmd.type === Command.Type.Move) {
                return cmd.worldObjectId === worldObject.id;
            }
            if (cmd.type === Command.Type.Disband) {
                return cmd.worldObjectId === worldObject.id;
            }
            if (cmd.type === Command.Type.ConstructTileImprovement) {
                return cmd.worldObjectId === worldObject.id;
            }
            return false;
        });

        // move
        if (worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.Movement)) {
            actions.push({
                type: "move",
                enabled: relevantCommands.length == 0,
                perform: () => UseMoveWindow.open(worldObject.id),
            } as MoveAction);
        }

        // disband
        if (worldObject.realm.ownedByUser) {
            actions.push({
                type: "disband",
                enabled: relevantCommands.length == 0,
                perform: () => WorldObjectService.disband(worldObject.id),
            } as DisbandAction);
        }

        // construct tile improvement
        if (worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.Builder)) {
            actions.push({
                type: "construct-tile-improvement",
                enabled: relevantCommands.length == 0,
                perform: () => UseTileImprovementConstructionWindow.open(worldObject.id),
            } as ConstructTileImprovementAction);
        }

        // spawn settlement
        if (worldObject.realm.ownedByUser && WorldObjectComponent.has(worldObject, WorldObjectComponent.Type.SettlementSpawner)) {
            actions.push({
                type: "spawn-settlement",
                enabled: relevantCommands.length == 0,
                perform: () => UseSettlementCreateWindow.open(worldObject.id),
            } as SpawnSettlementAction);
        }

        // cancel current command
        if (worldObject.realm.ownedByUser) {
            actions.push({
                type: "cancel-current-command",
                enabled: relevantCommands.length > 0,
                perform: () => relevantCommands.forEach(it => CommandService.cancelCommand(it.id)),
            } as CancelCurrentCommandAction);
        }

        return actions;
    }

}