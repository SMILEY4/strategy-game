import {TileSummary} from "../tile/tileSummary";
import {WorldObject} from "../worldobject/worldObject";

export type InteractionState = Interaction.MoveState | Interaction.CreateSettlementState;

export namespace Interaction {

    export enum Type {
        Move = "move",
        CreateSettlement = "create-settlement"
    }

    export type Mapping = {
        [Type.Move]: MoveState,
        [Type.CreateSettlement]: CreateSettlementState,
    }

    export interface MoveState {
        type: Type.Move;
        worldObjectId: WorldObject.Id,
        path: TileSummary[],
    }

    export interface CreateSettlementState {
        type: Type.CreateSettlement;
        worldObjectId: WorldObject.Id,
        location: TileSummary | null,
        name: string | null;
        validationErrors: string[]
    }

}