package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandData

interface TurnSubmitAction {

    sealed class TurnSubmitActionError
    object NotParticipantError : TurnSubmitActionError()

    suspend fun perform(userId: String, gameId: String, commands: List<CommandData>): Either<TurnSubmitActionError, Unit>

}