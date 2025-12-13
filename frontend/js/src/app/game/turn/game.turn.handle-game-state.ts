import {GameStateContainer} from "../../../models/misc/gameStateContainer";
import {GameSession} from "../../../models/misc/gameSession";
import {App} from "../../../appContext";
import {CameraService} from "../camera/game.camera.service";

export function handleGameState(gameState: GameStateContainer): void {
    App.interactionService.endInteraction();
    App.gameStateWriter.replaceGameState(gameState);
    App.gameStateWriter.setCurrentTurn(gameState.turn);
    if (App.gameStateAccess.getGameSessionState() === GameSession.SessionState.Loading) {
        App.gameStateWriter.setGameSessionState(GameSession.SessionState.Playing);
        CameraService.centerOnTile(App.gameStateAccess.getSpawnTile().position, 15);
    }
    App.gameStateWriter.setTurnState(GameSession.TurnState.Playing);
}