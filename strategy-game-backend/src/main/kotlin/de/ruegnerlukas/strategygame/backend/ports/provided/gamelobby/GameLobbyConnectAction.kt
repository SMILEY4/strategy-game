package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GameLobbyConnectAction {

	suspend fun perform(userId: String, connectionId: Int, gameId: String): Either<Unit, ApplicationError>

}