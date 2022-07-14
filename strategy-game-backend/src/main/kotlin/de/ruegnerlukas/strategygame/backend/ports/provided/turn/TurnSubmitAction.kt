package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand

interface TurnSubmitAction {

	suspend fun perform(userId: String, gameId: String, commands: List<PlaceMarkerCommand>): Either<ApplicationError, Unit>

}