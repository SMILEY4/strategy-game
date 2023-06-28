package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO

interface PlayerViewCreator {

    sealed interface PlayerViewCreatorError

    object GameNotFoundError : PlayerViewCreatorError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun build(userId: String, gameId: String): Either<PlayerViewCreatorError, GameExtendedDTO>

    fun build(userId: String, game: GameExtended): GameExtendedDTO
}