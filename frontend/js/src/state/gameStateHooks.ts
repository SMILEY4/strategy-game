import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {usePartialSingletonEntity, useQueryMultiple, useQuerySingle} from "../common/db/adapters/databaseHooks";
import {TileDatabase} from "./database/tileDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {RealmDatabase} from "./database/realmDatabase";
import {TileSummary} from "../models/tile/tileSummary";
import {Tile} from "../models/tile/tile";
import {WorldObject} from "../models/worldobject/worldObject";
import {Realm} from "../models/realm/realm";
import {WorldObjectComponent} from "../models/worldobject/worldObjectComponent";
import {InteractionStore} from "./database/interactionStore";
import {Interaction} from "../models/misc/interaction";

export namespace GameStateHooks {

    function UNINITIALIZED<T>(): T {
        return null as T;
    }

    let gameSessionDatabase: GameSessionDatabase = UNINITIALIZED();
    let tileDatabase: TileDatabase = UNINITIALIZED();
    let worldObjectDatabase: WorldObjectDatabase = UNINITIALIZED();
    let realmDatabase: RealmDatabase = UNINITIALIZED();

    export function initialize(dependencies: {
        gameSessionDatabase: GameSessionDatabase
        tileDatabase: TileDatabase
        worldObjectDatabase: WorldObjectDatabase
        realmDatabase: RealmDatabase
    }) {
        gameSessionDatabase = dependencies.gameSessionDatabase;
        tileDatabase = dependencies.tileDatabase;
        worldObjectDatabase = dependencies.worldObjectDatabase;
        realmDatabase = dependencies.realmDatabase;
    }

    export function useInteractionStateByType<T extends Interaction.Type>(type: T): Interaction.Mapping[T] | null {
        const current = InteractionStore.useState(it => it.currentState);
        if (current && current.type === type) {
            return current as Interaction.Mapping[T];
        } else {
            return null;
        }
    }

    /**
     * Get the remaining movement points of the currently moving game object
     */
    export function useRemainingMovementPoints(): number {
        const worldObjectId = InteractionStore.useState(state => state.currentState && state.currentState.type === Interaction.Type.Move ? state.currentState.worldObjectId : null);
        const path = InteractionStore.useState(state => state.currentState && state.currentState.type === Interaction.Type.Move ? state.currentState.path : []);
        const worldObject = useWorldObject(worldObjectId);
        if (worldObject) {
            const maxMovement = WorldObjectComponent.get(worldObject, WorldObjectComponent.Type.Movement).maxMovement;
            return maxMovement - (path.length - 1);
        } else {
            return 0;
        }
    }

    /**
     * Get the currently selected tile or null.
     */
    export function useSelectedTile(): TileSummary | null {
        return usePartialSingletonEntity(gameSessionDatabase, e => e.selectedTile);
    }

    /**
     * Get the tile with the given id
     */
    export function useTile(tileId: Tile.Id | null): Tile | null {
        return useQuerySingle(tileDatabase, TileDatabase.QUERY_BY_ID, tileId);
    }

    /**
     * Get the world object with the given id
     */
    export function useWorldObject(id: WorldObject.Id | null): WorldObject | null {
        return useQuerySingle(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id);
    }


    /**
     * Get the world objects at the given location
     */
    export function useWorldObjectAt(pos: Tile.Position | null): WorldObject[] {
        return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_POSITION, pos ? [pos.q, pos.r] : Tile.POSITION_NOWHERE);
    }

    /**
     * Get the world object belonging to the given realm
     */
    export function useWorldObjectsOfRealm(id: Realm.Id | null): WorldObject[] {
        return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_REALM_ID, id);
    }

    /**
     * Get the realm with the given id
     */
    export function useRealm(id: Realm.Id | null): Realm | null {
        return useQuerySingle(realmDatabase, RealmDatabase.QUERY_BY_ID, id);
    }

}