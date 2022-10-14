package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

    override suspend fun execute(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return database.replaceDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
            .mapLeft { EntityNotFoundError }
            .void()
    }

}