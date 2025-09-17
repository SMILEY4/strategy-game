import {GameState} from "../../../models/misc/gameState";

export interface GameMessageHandler {
	onGameState(gameState: GameState): void
}