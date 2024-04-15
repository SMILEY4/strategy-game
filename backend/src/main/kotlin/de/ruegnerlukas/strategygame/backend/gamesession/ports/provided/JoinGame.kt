package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

/**
 * Join an existing game
 */
interface JoinGame {

    sealed class GameJoinActionErrors : Exception()

    class UserAlreadyJoinedError : GameJoinActionErrors()

    class GameNotFoundError : GameJoinActionErrors()


    /**
     * Adds the given user as a new player to the game
     * @throws GameJoinActionErrors
     */
    suspend fun perform(userId: String, gameId: String)

}