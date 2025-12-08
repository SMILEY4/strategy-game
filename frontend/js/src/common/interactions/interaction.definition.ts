import {InteractionState} from "./interaction.state";
import {InteractionEvent} from "./interaction.event";

export type InteractionEndReason = "end-state" | "engine-end" | "interruption"

export interface InteractionDefinition<TState extends string, TEvent extends InteractionEvent, TContext> {
    id: string,
    initial: TState,
    context: TContext,
    onStart?: (data: {
        getCtx: () => TContext,
        setCtx: (ctx: TContext) => TContext
    }) => void,
    onEnd?: (data: {
        reason: InteractionEndReason,
        state: TState,
        getCtx: () => TContext,
        setCtx: (ctx: TContext) => TContext
    }) => void,
    states: Record<TState, InteractionState<TState, TEvent, TContext>>,
}