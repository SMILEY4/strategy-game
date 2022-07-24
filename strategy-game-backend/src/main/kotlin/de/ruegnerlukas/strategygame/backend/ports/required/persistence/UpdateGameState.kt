package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState

interface UpdateGameState {
	suspend fun perform(gameState: GameState)
}