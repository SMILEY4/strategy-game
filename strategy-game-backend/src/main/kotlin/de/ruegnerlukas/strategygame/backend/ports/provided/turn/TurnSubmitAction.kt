package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand

interface TurnSubmitAction {

	sealed class TurnSubmitActionError
	object NotParticipantError : TurnSubmitActionError()

	suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit>

}