import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";

export interface Entity {
    id: string,
    owner: string,
    position: ExtendedHexPosition,
    components: EntityComponent[]
}

export type EntityComponent =
    | { type: "player-spawn", radius: number }
    | { type: "settlement", name: string, isRealmCapital: boolean }


export type ExtractComponent<T extends EntityComponent['type']> = Extract<EntityComponent, { type: T }>;

export const EntityUtils = {

    hasComponent: <T extends EntityComponent["type"]>(entity: Entity, type: T): boolean => {
        return entity.components.some(it => it.type === type);
    },

    getComponent: <T extends EntityComponent["type"]>(entity: Entity, type: T): ExtractComponent<T> | null => {
        return (entity.components.find(it => it.type === type) ?? null) as (ExtractComponent<T> | null);
    },

};