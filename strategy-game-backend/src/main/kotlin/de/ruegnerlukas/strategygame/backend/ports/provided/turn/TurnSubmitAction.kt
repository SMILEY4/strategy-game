package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerCommand

interface TurnSubmitAction {

	sealed class TurnSubmitActionError
	object GameNotFoundError : TurnSubmitActionError()
	object NotParticipantError : TurnSubmitActionError()

	suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit>

}