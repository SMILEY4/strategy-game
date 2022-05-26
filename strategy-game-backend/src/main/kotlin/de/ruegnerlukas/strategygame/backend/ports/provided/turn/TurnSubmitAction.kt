package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Either

interface TurnSubmitAction {

	suspend fun perform(userId: String, gameId: String, commands: List<PlaceMarkerCommand>): Either<Unit, ApplicationError>

}