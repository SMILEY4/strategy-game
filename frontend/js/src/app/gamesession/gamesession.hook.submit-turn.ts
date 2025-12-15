import {GameSession} from "../../models/misc/gameSession";
import {gameInteractionEngine} from "../game/game.interaction-engine";
import {GameSessionConnectionClient} from "./gamesession.client.connection";
import {CommandMessage} from "../../models/messages/commandMessage";
import {CommandStateAccess} from "../game/command/game.command.state-access";
import {Db} from "../database";

export function useGameSessionSubmitTurn(): () => void {
    return () => {
        gameInteractionEngine.end();
        GameSessionConnectionClient.send({
            type: "submit-turn",
            payload: {
                commands: CommandStateAccess.getAll().map(it => CommandMessage.map(it)),
            },
        });
        clearCommands();
        setTurnStateWaiting();
    };
}


function setTurnStateWaiting() {
    Db.gameSession.update(() => ({
        turnState: GameSession.TurnState.Waiting,
    }));
}

function clearCommands(): void {
    Db.command.deleteAll();
}