package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameEntity> {
		return database
			.getDocument(Collections.GAMES, gameId, GameEntity::class.java)
			.mapLeft { EntityNotFoundError }
	}

}