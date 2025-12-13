import {WorldObject} from "../../../models/worldobject/worldObject";
import {useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {WorldObjectDatabase} from "../../../state/database/worldObjectDatabase";
import {App} from "../../../appContext";

export function useWorldObjectById(id: WorldObject.Id | null | undefined): WorldObject | null {
    return useQuerySingle(App.worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id);
}