import {InteractionEngine} from "../../../common/interactions/interaction.engine";
import {GameInteractionEvent} from "./game-interactions";
import {InteractionDefinition} from "../../../common/interactions/interaction.definition";

const engine: InteractionEngine<GameInteractionEvent> = null as any; // todo

export const GameInteractionsEngine = {

    start<TState extends string, TContext>(interaction: InteractionDefinition<TState, GameInteractionEvent, TContext>, initialContext: TContext): Promise<void> {
        return engine.start(interaction, initialContext);
    },

    end() {
        engine.end();
    },

    dispatch<T extends GameInteractionEvent>(event: T): Promise<void> {
        return engine.dispatch<T>(event);
    },

};