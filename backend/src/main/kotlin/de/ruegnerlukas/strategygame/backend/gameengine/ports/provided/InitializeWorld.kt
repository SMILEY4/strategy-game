package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

interface InitializeWorld {

    sealed interface InitializeWorldError

    object GameNotFoundError : InitializeWorldError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(gameId: String, worldSettings: WorldSettings): Either<InitializeWorldError, Unit>
}