import {useActiveInteractionId, useInteractionContext} from "../../../common/interactions/interaction.context-adapter";
import {
    WorldObjectMoveInteractionContext,
    worldObjectMoveInteractionDefinition,
} from "./game.worldobject.interaction.move";
import {WorldObjectComponent} from "../../../models/worldobject/worldObjectComponent";
import {WorldObject} from "../../../models/worldobject/worldObject";


export function useWorldObjectMovement(worldObject: WorldObject | null | undefined): {
    totalMovement: number,
    remainingMovement: number,
} {
    const currentInteractionId = useActiveInteractionId();
    const currentInteractionContext = useInteractionContext();

    if (worldObject && isMovementInteraction(currentInteractionContext, currentInteractionId)) {

        return {
            totalMovement: getTotalMovement(worldObject),
            remainingMovement: getRemainingMovement(worldObject, currentInteractionContext),
        };

    } else {
        return {
            totalMovement: 0,
            remainingMovement: 0,
        };
    }
}

function isMovementInteraction(_context: any | null, activeId: string | null): _context is WorldObjectMoveInteractionContext {
    return activeId === worldObjectMoveInteractionDefinition.id;
}

function getTotalMovement(worldObject: WorldObject): number {
    return WorldObjectComponent.get(worldObject, WorldObjectComponent.Type.Movement).maxMovement;
}

function getRemainingMovement(worldObject: WorldObject, context: WorldObjectMoveInteractionContext): number {
    const total = getTotalMovement(worldObject);
    const used = context.path.length - 1
    return Math.max(total - used, 0);
}