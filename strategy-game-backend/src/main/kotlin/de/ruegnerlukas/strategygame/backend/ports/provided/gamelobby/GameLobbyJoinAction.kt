package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either


interface GameLobbyJoinAction {

	suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError>

}