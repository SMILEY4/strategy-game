package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

	override suspend fun execute(game: GameEntity): Either<EntityNotFoundError, Unit> {
		return when (database.replaceDocument(Collections.GAMES, game.id!!, game)) {
			null -> EntityNotFoundError.left()
			else -> Unit.right()
		}
	}

}