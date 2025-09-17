import {GameStateContainer} from "../../../models/misc/gameStateContainer";

export interface GameMessageHandler {
	onGameState(gameState: GameStateContainer): void
}