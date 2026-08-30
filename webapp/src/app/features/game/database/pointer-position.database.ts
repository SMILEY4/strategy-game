import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type PointerPosition = {
    screen: [number, number],
    world: [number, number],
    hex: [number, number],
}

export type PointerPositionDatabase = SingletonDatabase<PointerPosition>

export function pointerPositionDatabase(): PointerPositionDatabase {
    return DatabaseBuilder
        .createSingleton<PointerPosition>()
        .withInitialValue({
            screen: [0,0],
            world: [0,0],
            hex: [0,0]
        })
        .build();
}