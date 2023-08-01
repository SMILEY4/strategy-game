package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CommandData

interface TurnSubmit {

    sealed class TurnSubmitActionError
    object NotParticipantError : TurnSubmitActionError()

    suspend fun perform(userId: String, gameId: String, commands: Collection<CommandData>): Either<TurnSubmitActionError, Unit>

}