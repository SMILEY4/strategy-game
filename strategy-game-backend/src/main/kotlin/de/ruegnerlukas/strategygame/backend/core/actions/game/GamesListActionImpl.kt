package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GamesQueryByUser
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GamesListActionImpl(private val queryGames: GamesQueryByUser) : GamesListAction, Logging {

	override suspend fun perform(userId: String): List<String> {
		log().info("Listing all game-ids of user $userId")
		return queryGames.execute(userId)
			.map { games -> games.map { it.id } }
			.getOrElse { listOf() }
	}

}