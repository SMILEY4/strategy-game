package de.ruegnerlukas.strategygame.backend.ports.required.persistence.world

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface WorldQuery {

	suspend fun execute(gameId: String): Either<DatabaseError, WorldEntity>

}