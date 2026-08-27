import {useQuerySingleton, useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import type {InteractionMachineState} from "@modules/interaction/interaction.machine.ts";
import type {InteractionBaseEvent, InteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {InteractionEventHandlers} from "@modules/interaction/interaction.manager.ts";

export function useInteraction<TContext, TEvent extends InteractionBaseEvent>(
    definition: InteractionDefinition<any, TContext, TEvent, any>,
): [TContext, InteractionEventHandlers<TEvent>] {
    const context = useInteractionContext(definition);
    const events = DI.interactionManager.events(definition);
    return [context, events];
}

export function useInteractionContext<TContext>(definition: InteractionDefinition<any, TContext, any, any>): TContext {
    const entity = useQuerySingleton<{ state: InteractionMachineState<TContext, string> | null }>(DI.interactionDatabase);
    if (entity.state === null || entity.state.definition !== definition) {
        throw new Error("Could not find interaction context");
    }
    return entity.state.context;
}


export function useInteractionEvents<TEvent extends InteractionBaseEvent>(
    definition: InteractionDefinition<any, any, TEvent, any>,
): InteractionEventHandlers<TEvent> {
    return DI.interactionManager.events(definition);
}

export function useHasInteraction(): boolean {
    useWatchDatabases([DI.interactionDatabase])
    return DI.interactionManager.hasActive()
}