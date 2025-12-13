import {useActiveInteractionId, useInteractionContext} from "../../../common/interactions/interaction.context-adapter";
import {
    WorldObjectMoveInteractionContext,
    worldObjectMoveInteractionDefinition,
} from "./game.worldobject.interaction.move";

export interface UseWorldObjectMovementData {
    totalMovement: number,
    remainingMovement: number,
}

export function useWorldObjectMovement(): UseWorldObjectMovementData {
    const currentInteractionId = useActiveInteractionId();
    const currentInteractionContext = useInteractionContext();

    if(isMovementInteraction(currentInteractionContext, currentInteractionId)) {
        return {
            totalMovement: 0,
            remainingMovement: 0,
        }
    } else {
        return {
            totalMovement: 0,
            remainingMovement: 0,
        }
    }
}

function isMovementInteraction(_context: any | null, activeId: string | null): _context is WorldObjectMoveInteractionContext {
    return activeId === worldObjectMoveInteractionDefinition.id
}