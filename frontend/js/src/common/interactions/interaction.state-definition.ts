import {InteractionEvent} from "./interaction.event";

/**
 * Definition for a single state in an interaction
 */
export type InteractionStateDefinition<TState extends string, TEvent extends InteractionEvent, TContext> = {
    onEnter?: (data: {
        getCtx: () => TContext,
        setCtx: (update: (ctx: TContext) => TContext) => void
        dispatch: (event: TEvent) => void,
    }) => void | PromiseLike<void>
    end?: boolean,
    transitions: {
        [E in TEvent["eventId"]]?: {
            target: TState,
            action?: (data: {
                event: Extract<TEvent, { name: E }>,
                getCtx: () => TContext,
                setCtx: (update: (ctx: TContext) => TContext) => void
            }) => void | PromiseLike<void>
        }
    }
}