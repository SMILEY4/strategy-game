package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface SendGameStateAction {

    sealed class SendGameStateActionError
    object GameNotFoundError : SendGameStateActionError()
    object UserNotConnectedError : SendGameStateActionError()

    suspend fun perform(gameId: String, userId: String, connectionId: Long): Either<SendGameStateActionError, Unit>

}