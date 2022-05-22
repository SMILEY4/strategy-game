package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Rail

class InMemoryGameRepository : GameRepository {

	private val gameLobbyEntities = mutableMapOf<String, GameLobbyEntity>()


	override fun save(entities: List<GameLobbyEntity>): Rail<List<GameLobbyEntity>> {
		entities.forEach { save(it) }
		return Rail.success(entities)
	}

	override fun save(entity: GameLobbyEntity): Rail<GameLobbyEntity> {
		gameLobbyEntities[entity.gameId] = entity
		return Rail.success(entity)
	}

	override fun get(gameId: String): Rail<GameLobbyEntity> {
		return when(val e = gameLobbyEntities[gameId]) {
			null -> Rail.error("NOT_FOUND")
			else -> Rail.success(e)
		}
	}

	override fun getByUserId(userId: String): Rail<List<GameLobbyEntity>> {
		return Rail.success(
			gameLobbyEntities.values.filter { lobby -> lobby.participants.map { p -> p.userId }.contains(userId) }
		)
	}

}