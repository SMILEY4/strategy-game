package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, Game> {
		return database
			.getDocument(Collections.GAMES, gameId, Game::class.java)
			.mapLeft { EntityNotFoundError }
	}

}