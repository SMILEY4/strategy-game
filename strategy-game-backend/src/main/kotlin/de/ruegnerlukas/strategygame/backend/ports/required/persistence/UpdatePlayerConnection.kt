package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either

interface UpdatePlayerConnection {
	suspend fun execute(playerId: String, connectionId: Int?): Either<EntityNotFoundError, Unit>
}