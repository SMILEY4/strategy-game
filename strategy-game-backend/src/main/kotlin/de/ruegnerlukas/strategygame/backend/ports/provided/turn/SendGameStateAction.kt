package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

interface SendGameStateAction {

    sealed class SendGameStateActionError
    object GameNotFoundError : SendGameStateActionError()
    object UserNotConnectedError : SendGameStateActionError()

    suspend fun perform(gameId: String, userId: String): Either<SendGameStateActionError, Unit>

    suspend fun perform(game: GameExtendedEntity, userId: String): Either<SendGameStateActionError, Unit>

}