package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either

/**
 * Join an existing game
 */
interface JoinGame {

    sealed class GameJoinActionErrors

    object UserAlreadyPlayerError : GameJoinActionErrors() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object GameNotFoundError : GameJoinActionErrors() {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit>

}