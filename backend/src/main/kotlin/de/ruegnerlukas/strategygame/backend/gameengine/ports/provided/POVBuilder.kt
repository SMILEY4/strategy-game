package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import arrow.core.continuations.nullable
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

interface POVBuilder {

    sealed interface PlayerViewCreatorError

    object GameNotFoundError : PlayerViewCreatorError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun build(userId: String, gameId: String): Either<PlayerViewCreatorError, JsonType>

    fun build(userId: String, game: GameExtended): JsonType
}