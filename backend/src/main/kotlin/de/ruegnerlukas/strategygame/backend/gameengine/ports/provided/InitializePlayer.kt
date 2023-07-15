package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

interface InitializePlayer {

    sealed interface InitializePlayerError

    object GameNotFoundError : InitializePlayerError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(gameId: String, userId: String, color: RGBColor): Either<InitializePlayerError, Unit>
}