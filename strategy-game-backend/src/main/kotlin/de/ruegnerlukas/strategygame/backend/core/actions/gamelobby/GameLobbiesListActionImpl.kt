package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GamesQueryByUser
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbiesListAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map

class GameLobbiesListActionImpl(database: Database) : GameLobbiesListAction, Logging {

	private val queryGames = GamesQueryByUser(database)

	override suspend fun perform(userId: String): Either<List<String>, ApplicationError> {
		log().info("Listing all game-ids of user $userId")
		return Either.start()
			.flatMap { queryGames.execute(userId) }
			.map { games -> games.map { it.id } }
	}

}