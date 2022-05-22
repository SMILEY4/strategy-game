package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.shared.Rail

interface GameRepository {
	fun save(entities: List<GameLobbyEntity>): Rail<List<GameLobbyEntity>>
	fun save(entity: GameLobbyEntity): Rail<GameLobbyEntity>
	fun get(gameId: String): Rail<GameLobbyEntity>
	fun getByUserId(userId: String): Rail<List<GameLobbyEntity>>
}