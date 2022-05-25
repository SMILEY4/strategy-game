package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.Either

interface GameLobbiesListAction {

	suspend fun perform(userId: String): Either<List<String>, ApplicationError>

}