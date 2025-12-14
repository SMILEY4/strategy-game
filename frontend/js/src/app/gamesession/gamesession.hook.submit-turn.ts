import {GameSession} from "../../models/misc/gameSession";
import {App} from "../../appContext";
import {gameInteractionEngine} from "../game/game.interaction-engine";
import {GameSessionConnectionClient} from "./gamesession.client.connection";
import {CommandMessage} from "../../models/messages/commandMessage";

export function useGameSessionSubmitTurn(): () => void {
    return () => {
        gameInteractionEngine.end();
        GameSessionConnectionClient.send({
            type: "submit-turn",
            payload: {
                commands: App.gameStateAccess.getCommands().map(it => CommandMessage.map(it))
            }
        })
        App.gameStateWriter.clearCommands();
        App.gameStateWriter.setTurnState(GameSession.TurnState.Waiting);
    };
}