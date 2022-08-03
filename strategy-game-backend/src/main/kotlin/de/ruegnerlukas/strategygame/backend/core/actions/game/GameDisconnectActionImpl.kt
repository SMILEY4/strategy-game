package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGamesByUser
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
	private val queryGamesByUser: QueryGamesByUser,
	private val updateGame: UpdateGame
) : GameDisconnectAction, Logging {

	override suspend fun perform(userId: String) {
		log().info("Disconnect user $userId from all currently connected games")
		val games = findGames(userId)
		clearConnections(userId, games)
	}


	/**
	 * find all games of the current user
	 */
	private suspend fun findGames(userId: String): List<GameEntity> {
		return queryGamesByUser.execute(userId)
	}


	/**
	 * Set all connections of the given user to "null"
	 */
	private suspend fun clearConnections(userId: String, games: List<GameEntity>) {
		games
			.filter { game -> game.players.find { it.userId == userId }?.connectionId != null }
			.forEach { game ->
				game.players.find { it.userId == userId }?.connectionId = null
				updateGame.execute(game)
			}
	}

}