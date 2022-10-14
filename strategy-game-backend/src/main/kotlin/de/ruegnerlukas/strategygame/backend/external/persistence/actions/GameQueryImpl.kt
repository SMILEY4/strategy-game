package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

    override suspend fun execute(gameId: String): Either<EntityNotFoundError, Game> {
        return database
            .getDocument(Collections.GAMES, gameId, GameEntity::class.java)
            .map { it.asServiceModel() }
            .mapLeft { EntityNotFoundError }
    }

}