package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

	override suspend fun execute(game: GameEntity): Either<EntityNotFoundError, Unit> {
		return database.replaceDocument(Collections.GAMES, game.key!!, game)
			.mapLeft { EntityNotFoundError }
			.void()
	}

}