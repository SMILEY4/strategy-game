package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either

interface UpdatePlayerState {
	suspend fun execute(playerId: String, state: String): Either<EntityNotFoundError, Unit>
}