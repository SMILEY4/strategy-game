import {InteractionEvent} from "./interaction.event";

/**
 * Definition for a single state in an interaction
 */
export type InteractionStateDefinition<TState extends string, TEvent extends InteractionEvent, TContext> = {
    onEnter?: (data: ParametersOnEnterAction<TEvent, TContext>) => void | PromiseLike<void>
    end?: boolean,
    transitions: {
        [E in TEvent["eventId"]]?: {
            target: TState,
            action?: (data: {
                event: EventById<TEvent, E>,
                getCtx: () => TContext,
                setCtx: (update: (ctx: TContext) => TContext) => void
            }) => void | PromiseLike<void>
        }
    }
}

export type ParametersOnEnterAction<TEvent extends InteractionEvent, TContext> = {
    getCtx: () => TContext,
    setCtx: (update: (ctx: TContext) => TContext) => void
    dispatch: (event: TEvent) => void,
}

export type ParametersOnTransitionAction<TEvent extends InteractionEvent, EventId extends TEvent["eventId"], TContext> = {
    event: EventById<TEvent, EventId>,
    getCtx: () => TContext,
    setCtx: (update: (ctx: TContext) => TContext) => void
}

type EventById<
    AllEvents extends InteractionEvent,
    Id extends AllEvents["eventId"]
> =
    AllEvents extends { eventId: Id } ? AllEvents : never;