package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionByUserSetNull
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyDisconnectAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap

class GameLobbyDisconnectActionImpl(database: Database) : GameLobbyDisconnectAction, Logging {

	private val updatePlayerConnection = PlayerUpdateConnectionByUserSetNull(database)

	override suspend fun perform(userId: String): Either<Unit, ApplicationError> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return Either.start()
			.flatMap { updatePlayerConnection.execute(userId) }
	}

}