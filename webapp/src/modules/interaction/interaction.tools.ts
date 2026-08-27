import {useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import type {InteractionMachineState} from "@modules/interaction/interaction.machine.ts";
import type {InteractionBaseEvent, InteractionDefinition} from "@modules/interaction/interaction.definition.ts";


export function useInteractionContext<TContext>(definition: InteractionDefinition<any, TContext, any, any>): TContext {
    const entity = useQuerySingleton<{ state: InteractionMachineState<TContext, string> | null }>(DI.interactionDatabase);
    if (entity.state === null || entity.state.definition !== definition) {
        throw new Error("Could not find interaction context");
    }
    return entity.state.context;
}

export function useInteractionEvents<TEvent extends InteractionBaseEvent>(
    definition: InteractionDefinition<any, any, TEvent, any>
): Record<TEvent["type"], (event: Omit<TEvent, "type">) => void> {
    const sendEvent = (event: TEvent) => DI.interactionManager.send(definition, event);
    return null as any
}