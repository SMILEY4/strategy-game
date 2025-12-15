import {InteractionEngine} from "../../common/interactions/interaction.engine";
import {ZustandInteractionContextAdapter} from "../../common/interactions/interaction.context-adapter";
import {WorldObjectMoveInteractionEvent} from "./worldobject/worldobject.interaction.move";
import {SettlementCreateInteractionEvent} from "./settlement/settlement.interaction.create";


type GameInteractionEvents =
    | WorldObjectMoveInteractionEvent
    | SettlementCreateInteractionEvent

export const gameInteractionEngine = new InteractionEngine<GameInteractionEvents>(ZustandInteractionContextAdapter);
