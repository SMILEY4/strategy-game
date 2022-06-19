package de.ruegnerlukas.strategygame.backend.external.persistence.old

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.required.OldGameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Err
import de.ruegnerlukas.strategygame.backend.shared.either.Ok

class InMemoryOldGameRepository : OldGameRepository {

	private val gameEntities = mutableMapOf<String, Game>()


	override fun save(entities: List<Game>): Either<List<Game>, ApplicationError> {
		entities.forEach { save(it) }
		return Ok(entities)
	}

	override fun save(entity: Game): Either<Game, ApplicationError> {
		gameEntities[entity.gameId] = entity
		return Ok(entity)
	}

	override fun get(gameId: String): Either<Game, ApplicationError> {
		return when(val e = gameEntities[gameId]) {
			null -> Err(EntityNotFoundError)
			else -> Ok(e)
		}
	}

	override fun getByUserId(userId: String): Either<List<Game>, ApplicationError> {
		return Ok(
			gameEntities.values.filter { lobby -> lobby.participants.map { p -> p.userId }.contains(userId) }
		)
	}

}