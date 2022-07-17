package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either

interface UpdateGameTurn {
	suspend fun execute(gameId: String, turn: Int): Either<EntityNotFoundError, Unit>
}