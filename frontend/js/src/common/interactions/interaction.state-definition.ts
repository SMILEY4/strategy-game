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
            condition?: (data: {
                event: EventById<TEvent, E>,
                getCtx: () => TContext,
            }) => boolean | PromiseLike<boolean>
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


type EventById<
    AllEvents extends InteractionEvent,
    Id extends AllEvents["eventId"]
> =
    AllEvents extends { eventId: Id } ? AllEvents : never;