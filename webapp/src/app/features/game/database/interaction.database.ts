import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";
import type {InteractionMachineState} from "@modules/interaction/interaction.machine.ts";

export type InteractionDatabase = SingletonDatabase<{ state: InteractionMachineState<any, string> | null }>

export function interactionDatabase(): InteractionDatabase {
    return DatabaseBuilder
        .createSingleton<{ state: InteractionMachineState<any, string> | null }>()
        .withInitialValue({state: null})
        .build();
}