import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";
import type {InteractionState} from "@modules/interaction-v1/interaction.state.ts";

export type InteractionDatabase = SingletonDatabase<InteractionState<any, any, string>>

export function interactionDatabase(): InteractionDatabase {
    return DatabaseBuilder
        .createSingleton<InteractionState<any, any, string>>()
        .withInitialValue({active: null})
        .build();
}