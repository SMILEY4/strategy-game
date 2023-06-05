package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface SendGameStateAction {

    sealed class SendGameStateActionError
    object GameNotFoundError : SendGameStateActionError()
    object UserNotConnectedError : SendGameStateActionError()

    suspend fun perform(gameId: String, userId: String): Either<SendGameStateActionError, Unit>

    suspend fun perform(game: GameExtended, userId: String): Either<SendGameStateActionError, Unit>

}