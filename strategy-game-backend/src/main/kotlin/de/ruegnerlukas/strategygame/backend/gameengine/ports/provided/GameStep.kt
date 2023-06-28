package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command

interface GameStep {

    sealed interface GameStepError

    object GameNotFoundError : GameStepError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(
        gameId: String,
        commands: List<Command<*>>,
        userIds: List<String>
    ): Either<GameStepError, Map<String, GameExtendedDTO>>
}