import {Interaction, InteractionState} from "../../../models/misc/interaction";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";

export interface InteractionService {

    /**
     * Start a new interaction. Ends any current interaction.
     */
    startInteraction(interaction: InteractionState): void;

    /**
     * Ends the current interaction.
     * Returns the final state of the interaction (or null)
     */
    endInteraction(): void;

    /**
     * Ends the current interaction.
     * Provide the type of the interaction to end as an additional safeguard.
     * Returns the final state of the interaction (or null)
     */
    endInteractionOfType<T extends Interaction.Type>(type: T): Interaction.Mapping[T] | null;

    /**
     * Ends the current interaction state.
     * Provide the type of the interaction to end as an additional safeguard.
     */
    updateInteractionOfType<T extends Interaction.Type>(type: T, func: (current: Interaction.Mapping[T]) => Interaction.Mapping[T]): void;

    /**
     * Get the current interaction state (or null).
     * Provide the type of the interaction to end as an additional safeguard.
     */
    getCurrentInteractionOfType<T extends Interaction.Type>(type: T): Interaction.Mapping[T] | null;

}

export class InteractionServiceImpl implements InteractionService {

    constructor(
        private readonly gameStateAccess: GameStateAccess,
        private readonly gameStateWriter: GameStateWriter,
    ) {
    }


    startInteraction(interaction: InteractionState): void {
        const current = this.gameStateAccess.getInteractionState();
        if (current) {
            this.endInteraction()
        }
        this.gameStateWriter.setInteractionState(interaction);
    }

    endInteraction(): void {
        this.gameStateWriter.setInteractionState(null);
    }

    endInteractionOfType<T extends Interaction.Type>(type: T): Interaction.Mapping[T] | null {
        const current = this.getCurrentInteractionOfType(type);
        if (current) {
            this.endInteraction()
            return current;
        } else {
            return null;
        }
    }


    updateInteractionOfType<T extends Interaction.Type>(type: T, func: (current: Interaction.Mapping[T]) => Interaction.Mapping[T]): void {
        const current = this.getCurrentInteractionOfType(type);
        if (current) {
            const next = func(current);
            this.gameStateWriter.setInteractionState(next);
        }
    }


    getCurrentInteractionOfType<T extends Interaction.Type>(type: T): Interaction.Mapping[T] | null {
        const current = this.gameStateAccess.getInteractionState();
        if (current && current.type === type) {
            return current as Interaction.Mapping[T];
        } else {
            return null;
        }
    }


}
