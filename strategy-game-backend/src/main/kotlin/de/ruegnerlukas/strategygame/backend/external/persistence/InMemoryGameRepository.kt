package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Err
import de.ruegnerlukas.strategygame.backend.shared.Ok

class InMemoryGameRepository : GameRepository {

	private val gameLobbyEntities = mutableMapOf<String, GameLobbyEntity>()


	override fun save(entities: List<GameLobbyEntity>): Either<List<GameLobbyEntity>, ApplicationError> {
		entities.forEach { save(it) }
		return Ok(entities)
	}

	override fun save(entity: GameLobbyEntity): Either<GameLobbyEntity, ApplicationError> {
		gameLobbyEntities[entity.gameId] = entity
		return Ok(entity)
	}

	override fun get(gameId: String): Either<GameLobbyEntity, ApplicationError> {
		return when(val e = gameLobbyEntities[gameId]) {
			null -> Err(EntityNotFoundError)
			else -> Ok(e)
		}
	}

	override fun getByUserId(userId: String): Either<List<GameLobbyEntity>, ApplicationError> {
		return Ok(
			gameLobbyEntities.values.filter { lobby -> lobby.participants.map { p -> p.userId }.contains(userId) }
		)
	}

}