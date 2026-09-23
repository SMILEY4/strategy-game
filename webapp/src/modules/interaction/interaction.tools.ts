import {useQuerySingleton, useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import type {InteractionMachineState} from "@modules/interaction/interaction.machine.ts";
import type {InteractionBaseEvent, InteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {InteractionEventHandlers} from "@modules/interaction/interaction.manager.ts";
import {type InteractionDatabase} from "@app/features/game/database/interaction.database.ts";

export function useInteraction<TContext, TEvent extends InteractionBaseEvent, TStateName extends string>(
    definition: InteractionDefinition<any, TContext, TEvent, TStateName>,
): [TContext, InteractionEventHandlers<TEvent>, TStateName] {
    const context = useInteractionContext(definition);
    const state = useInteractionState(definition);
    const events = DI.interactionManager.events(definition);
    return [context, events, state];
}

export function useInteractionContext<TContext>(definition: InteractionDefinition<any, TContext, any, any>): TContext {
    const entity = useQuerySingleton<{ state: InteractionMachineState<TContext, string> | null }>(DI.interactionDatabase);
    if (entity.state === null || entity.state.definition !== definition) {
        throw new Error("Could not find interaction");
    }
    return entity.state.context;
}

export function useInteractionState<TStateName extends string>(definition: InteractionDefinition<any, any, any, TStateName>): TStateName {
    const entity = useQuerySingleton<{ state: InteractionMachineState<any, string> | null }>(DI.interactionDatabase);
    if (entity.state === null || entity.state.definition !== definition) {
        throw new Error("Could not find interaction");
    }
    return entity.state.stateName as TStateName;
}

export function useInteractionEvents<TEvent extends InteractionBaseEvent>(
    definition: InteractionDefinition<any, any, TEvent, any>,
): InteractionEventHandlers<TEvent> {
    return DI.interactionManager.events(definition);
}

export function useHasInteraction(): boolean {
    useWatchDatabases([DI.interactionDatabase]);
    return DI.interactionManager.hasActive();
}

export function isInteractionActive(db: InteractionDatabase, definition: InteractionDefinition<any, any, any, any>) {
    return db.get().state?.definition === definition;
}

export function getInteractionContext<TContext>(db: InteractionDatabase, definition: InteractionDefinition<any, TContext, any, any>): TContext | null {
    const state = db.get().state;
    if (state === null || state.definition !== definition) {
        return null;
    } else {
        return state.context;
    }
}

export function getInteractionState<TStateName extends string>(db: InteractionDatabase, definition: InteractionDefinition<any, any, any, TStateName>): TStateName | null {
    const state = db.get().state;
    if (state === null || state.definition !== definition) {
        return null;
    } else {
        return state.stateName as TStateName;
    }
}