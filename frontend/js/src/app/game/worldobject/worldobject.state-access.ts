import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {WorldObject, WorldObjectWithCommand} from "../../../models/worldobject/worldObject";
import {useQueryMultiple, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {Tile} from "../../../models/tile/tile";
import {Realm} from "../../../models/realm/realm";
import {Db} from "../../database";
import {DbCache} from "../../../common/db/dbCache";
import {CommandStateAccess} from "../command/command.state-access";
import {Command} from "../../../models/command/command";
import {UID} from "../../../common/uid";


let worldObjectCache: DbCache<WorldObject[]> | null = null;

function getWorldObjectCache(): DbCache<WorldObject[]> {
    if (worldObjectCache) return worldObjectCache;
    worldObjectCache = new DbCache({
        dataProvider: () => WorldObjectStateAccess.getAllUncached(),
        dependencies: [Db.worldObject],
    });
    return worldObjectCache;
}

export const WorldObjectStateAccess = {

    useWorldObjectById(id: WorldObject.Id | null | undefined): WorldObject | null {
        return useQuerySingle(Db.worldObject, WorldObjectDatabase.QUERY_BY_ID, id);
    },

    useWorldObjectByPosition(position: Tile.Position | null | undefined): WorldObject[] {
        const pos = position ? [position.q, position.r] : Tile.POSITION_NOWHERE;
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_BY_POSITION, pos);
    },

    useWorldObjectByRealm(id: Realm.Id | null): WorldObject[] {
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_BY_REALM_ID, id);
    },

    getWorldObjectsRevId(): string {
        return Db.worldObject.getRevId();
    },

    getAllUncached(): WorldObject[] {
        return Db.worldObject.queryMany(WorldObjectDatabase.QUERY_ALL, null);
    },

    getAll(): WorldObject[] {
        return getWorldObjectCache().get();
    },

    getAllWithCommands(): WorldObjectWithCommand[] {
        let worldObjects: WorldObjectWithCommand[] = WorldObjectStateAccess.getAll();
        const commands = CommandStateAccess.getAll();

        commands.forEach(command => {

            if(command.type === Command.Type.Disband) {
                worldObjects = worldObjects.map(worldObject => {
                    if(worldObject.id === command.worldObjectId){
                        return {
                            ...worldObject,
                            commandState: "destroy"
                        }
                    }
                    return worldObject
                })
            }

            if(command.type === Command.Type.ConstructTileImprovement) {
                worldObjects = worldObjects.flatMap(worldObject => {
                    if(worldObject.id === command.worldObjectId){
                        return [
                            worldObject,
                            {
                                commandState: "create",
                                id: UID.generate() as WorldObject.Id,
                                type: {
                                    group: WorldObject.TypeGroup.TileImprovement,
                                    name: command.tileImprovementType
                                },
                                realm: worldObject.realm,
                                tile: worldObject.tile,
                                components: [],
                            }
                        ]
                    }
                    return [worldObject]
                })
            }

            if(command.type === Command.Type.CreateSettlement) {
                worldObjects = worldObjects.flatMap(worldObject => {
                    if(worldObject.id === command.worldObjectId){
                        return [
                            worldObject,
                            {
                                commandState: "create",
                                id: UID.generate() as WorldObject.Id,
                                type: {
                                    group: WorldObject.TypeGroup.Settlement,
                                    name: command.name
                                },
                                realm: worldObject.realm,
                                tile: command.tile,
                                components: [],
                            }
                        ]
                    }
                    return [worldObject]
                })
            }

        })

        return worldObjects
    },

    getSummariesAt(q: number, r: number): WorldObjectSummary[] {
        return Db.worldObject.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [q, r]);
    },

};