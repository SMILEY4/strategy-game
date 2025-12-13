import {GameSession} from "../../models/misc/gameSession";
import {App} from "../../appContext";

export function useGameSessionSubmitTurn(): () => void {
    return () => {
        App.interactionService.endInteraction();
        App.gameSessionClient.submitTurn(App.gameStateAccess.getCommands());
        App.gameStateWriter.clearCommands();
        App.gameStateWriter.setTurnState(GameSession.TurnState.Waiting);
    };
}