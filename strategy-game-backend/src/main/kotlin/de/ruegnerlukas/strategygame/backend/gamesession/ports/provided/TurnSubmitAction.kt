package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandData

interface TurnSubmitAction {

    sealed class TurnSubmitActionError
    object NotParticipantError : TurnSubmitActionError()

    suspend fun perform(userId: String, gameId: String, commands: List<CommandData>): Either<TurnSubmitActionError, Unit>

}