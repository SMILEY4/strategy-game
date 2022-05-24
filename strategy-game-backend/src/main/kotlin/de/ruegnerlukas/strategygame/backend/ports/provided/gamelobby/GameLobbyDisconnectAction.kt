package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.Either


interface GameLobbyDisconnectAction {

	suspend fun perform(userId: String): Either<Unit, ApplicationError>

}