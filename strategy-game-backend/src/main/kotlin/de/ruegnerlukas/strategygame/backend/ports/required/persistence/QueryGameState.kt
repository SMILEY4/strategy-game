package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState

interface QueryGameState {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameState>
}