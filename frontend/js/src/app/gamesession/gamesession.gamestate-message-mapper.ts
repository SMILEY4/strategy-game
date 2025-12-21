import {
    GameStateMessage,
    RealmMessage,
    ResourceTypeMsg,
    TerrainTypeMsg,
    VisibilityMsg,
    WorldObjectTypeGroupMsg,
} from "../../models/messages/gameStateMessage";
import {GameStateContainer} from "../../models/misc/gameStateContainer";
import {Tile} from "../../models/tile/tile";
import {Visibility} from "../../models/misc/visibility";
import {mapHidden} from "../../common/hiddenType";
import {TerrainType} from "../../models/misc/terrainType";
import {Projections} from "../../common/webgl/projections";
import {Realm} from "../../models/realm/realm";
import {WorldObject} from "../../models/worldobject/worldObject";
import {WorldObjectComponent} from "../../models/worldobject/worldObjectComponent";
import {User} from "../../models/misc/userId";
import {ResourceType} from "../../models/misc/resourceType";
import {Color} from "../../common/color/color";
import {Route} from "../../models/route/route";
import {WorldObjectSummary} from "../../models/worldobject/worldObjectSummary";

export namespace GameStateMapper {

    export function map(gameStateMsg: GameStateMessage): GameStateContainer {
        return {
            turn: gameStateMsg.game.turn,
            commands: [],
            tiles: buildTiles(gameStateMsg),
            realms: buildRealms(gameStateMsg),
            worldObjects: buildWorldObjects(gameStateMsg),
            routes: buildRoutes(gameStateMsg),
        };
    }

    const visibilityMapping: Record<VisibilityMsg, Visibility> = {
        "UNKNOWN": Visibility.UNKNOWN,
        "DISCOVERED": Visibility.DISCOVERED,
        "VISIBLE": Visibility.VISIBLE,
    };

    const terrainTypeMapping: Record<TerrainTypeMsg, TerrainType> = {
        "LAND": TerrainType.LAND,
        "WATER": TerrainType.WATER,
    };

    const resourceTypeMapping: Record<ResourceTypeMsg, ResourceType> = {
        "RAW_WOOD": ResourceType.RAW_WOOD,
        "RAW_FISH": ResourceType.RAW_FISH,
        "RAW_STONE": ResourceType.RAW_STONE,
        "RAW_METAL": ResourceType.RAW_METAL,
        "TIMBER": ResourceType.TIMBER,
        "FOOD": ResourceType.FOOD,
        "STONE": ResourceType.STONE,
        "METAL": ResourceType.METAL,
    };

    const worldObjectTypeGroupMapping: Record<WorldObjectTypeGroupMsg, WorldObject.TypeGroup> = {
        "unit": WorldObject.TypeGroup.Unit,
        "tile-improvement": WorldObject.TypeGroup.TileImprovement,
        "settlement": WorldObject.TypeGroup.Settlement,
    };

    function buildTiles(gameStateMsg: GameStateMessage): Tile[] {
        return gameStateMsg.tiles.map(tileMsg => ({
            id: tileMsg.identifier.id as Tile.Id,
            position: {
                q: tileMsg.identifier.q,
                r: tileMsg.identifier.r,
            },
            visibility: visibilityMapping[tileMsg.visibility],
            base: mapHidden(tileMsg.base, baseMsg => ({
                terrainType: terrainTypeMapping[baseMsg.terrainType],
                height: baseMsg.height,
                resources: baseMsg.resources.map(res => ({
                    type: resourceTypeMapping[res.type],
                    amount: res.amount,
                    maxAmount: res.maxAmount,
                    changeRate: res.changeRate,
                    canDeplete: res.canDeplete,
                }))
            })),
            metaProperties: {
                seed: tileMsg.metaProperties.seed,
                worldPosition: Projections.hexToWorld(tileMsg.identifier.q, tileMsg.identifier.r),
            },
        }));
    }

    function buildRealms(gameStateMsg: GameStateMessage): Realm[] {
        return gameStateMsg.realms.map(realmMsg => ({
            id: realmMsg.id as Realm.Id,
            name: realmMsg.name,
            color: Color.rgbByte(
                realmMsg.color.red,
                realmMsg.color.green,
                realmMsg.color.blue,
            ),
            ownedByUser: realmMsg.ownedByUser,
            player: {
                userId: realmMsg.player.userId as User.Id,
                name: realmMsg.player.name,
            },
        }));
    }

    function buildWorldObjects(gameStateMsg: GameStateMessage): WorldObject[] {
        return gameStateMsg.worldObjects.map(worldObjMsg => {
            const realmMsg = findRealmById(gameStateMsg, worldObjMsg.realm.id);
            return {
                id: worldObjMsg.id as WorldObject.Id,
                type: {
                    group: worldObjectTypeGroupMapping[worldObjMsg.type.group],
                    name: worldObjMsg.type.name,
                },
                realm: {
                    id: realmMsg.id as Realm.Id,
                    name: realmMsg.name,
                    color: Color.rgbByte(
                        realmMsg.color.red,
                        realmMsg.color.green,
                        realmMsg.color.blue,
                    ),
                    ownedByUser: realmMsg.ownedByUser,
                    playerName: realmMsg.player.name,
                },
                tile: {
                    id: worldObjMsg.tile.id as Tile.Id,
                    position: {
                        q: worldObjMsg.tile.q,
                        r: worldObjMsg.tile.r,
                    },
                },
                components: worldObjMsg.components.map(componentMsg => {
                    if (componentMsg.type == "movement") {
                        return {
                            type: "movement",
                            maxMovement: componentMsg.maxMovement,
                        } as WorldObjectComponent.Movement;
                    }
                    if (componentMsg.type == "vision") {
                        return {
                            type: "vision",
                            radius: componentMsg.radius,
                        } as WorldObjectComponent.Vision;
                    }
                    if (componentMsg.type == "builder") {
                        return {
                            type: "builder",
                            maxUses: componentMsg.maxUses,
                            remainingUses: componentMsg.remainingUses,
                            options: componentMsg.options,
                        } as WorldObjectComponent.Builder;
                    }
                    if (componentMsg.type == "settlementSpawner") {
                        return {
                            type: "settlement-spawner",
                        } as WorldObjectComponent.SettlementSpawner;
                    }
                    if (componentMsg.type == "routeNode") {
                        return {
                            type: "route-node",
                        } as WorldObjectComponent.RouteNode;
                    }
                    if (componentMsg.type == "economy") {
                        return {
                            type: "economy",
                            storage: componentMsg.storage,
                            entries: componentMsg.entries,
                            log: componentMsg.log,
                        } as WorldObjectComponent.Economy;
                    }

                    // exhaustiveness check: syntax error in case of unhandled action type
                    // noinspection UnnecessaryLocalVariableJS
                    const _exhaustive: never = componentMsg;
                    throw new Error("Unexpected component type: " + _exhaustive);
                }),
            };
        });
    }

    function buildRoutes(gameStateMsg: GameStateMessage): Route[] {

        function buildWorldObjectSummary(id: string): WorldObjectSummary {
            const worldObjectMsg = gameStateMsg.worldObjects.find(it => it.id === id)!;
            const realmMsg = gameStateMsg.realms.find(it => it.id === worldObjectMsg.realm.id)!;
            return {
                id: id as WorldObject.Id,
                type: {
                    group: worldObjectMsg.type.group,
                    name: worldObjectMsg.type.name,
                },
                realm: {
                    id: worldObjectMsg.realm.id as Realm.Id,
                    name: worldObjectMsg.realm.name,
                    color: new Color.ColorRgbByte(realmMsg.color.red, realmMsg.color.green, realmMsg.color.blue),
                    playerName: realmMsg.player.name,
                    ownedByUser: realmMsg.ownedByUser,
                },
                tile: {
                    id: worldObjectMsg.tile.id as Tile.Id,
                    position: {
                        q: worldObjectMsg.tile.q,
                        r: worldObjectMsg.tile.r,
                    },
                },
            };
        }

        return gameStateMsg.routes.map(routeMsg => {
            return {
                id: routeMsg.id as Route.Id,
                worldObjectA: mapHidden(routeMsg.worldObjectA, worldObjectId => buildWorldObjectSummary(worldObjectId)),
                worldObjectB: mapHidden(routeMsg.worldObjectB, worldObjectId => buildWorldObjectSummary(worldObjectId)),
                cost: routeMsg.cost,
                path: routeMsg.path.map(it => ({
                    id: it.id as Tile.Id,
                    position: {q: it.q, r: it.r},
                })),
            };
        });
    }

    function findRealmById(gameStateMsg: GameStateMessage, id: string): RealmMessage {
        const result = gameStateMsg.realms.find(it => it.id === id);
        if (!result) {
            throw new Error("Could not find realm with id '" + id + "'");
        }
        return result;
    }

}