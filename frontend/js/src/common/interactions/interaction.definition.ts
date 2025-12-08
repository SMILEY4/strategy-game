import {InteractionEvent} from "./interaction.event";
import {InteractionStateDefinition} from "./interaction.state-definition";

/**
 * Reasons for why an interaction has ended.
 */
export type InteractionEndReason = "end-state" | "engine-end" | "interruption"

/**
 * Complete definition of a single interaction.
 */
export interface InteractionDefinition<TState extends string, TEvent extends InteractionEvent, TContext> {
    id: string,
    initial: TState,
    onStart?: (data: {
        getCtx: () => TContext,
        setCtx: (update: (ctx: TContext) => TContext) => void
    }) => void,
    onEnd?: (data: {
        reason: InteractionEndReason,
        state: TState,
        getCtx: () => TContext,
        setCtx: (update: (ctx: TContext) => TContext) => void
    }) => void,
    states: Record<TState, InteractionStateDefinition<TState, TEvent, TContext>>,
}