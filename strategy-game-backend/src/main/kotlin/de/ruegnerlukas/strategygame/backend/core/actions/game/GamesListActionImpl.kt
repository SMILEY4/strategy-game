package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GamesQueryByUser
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map

class GamesListActionImpl(private val queryGames: GamesQueryByUser) : GamesListAction, Logging {

	override suspend fun perform(userId: String): Either<List<String>, ApplicationError> {
		log().info("Listing all game-ids of user $userId")
		return Either.start()
			.flatMap { queryGames.execute(userId) }
			.map { games -> games.map { it.id } }
	}

}