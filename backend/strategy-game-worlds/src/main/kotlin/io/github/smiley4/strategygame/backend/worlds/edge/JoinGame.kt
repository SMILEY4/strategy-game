package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Join an existing game
 */
interface JoinGame {

    sealed class GameJoinActionErrors(message: String, cause: Throwable? = null) : Exception(message, cause)
    class UserAlreadyJoinedError(cause: Throwable? = null) : GameJoinActionErrors("The user is already a player in the given game", cause)
    class GameNotFoundError(cause: Throwable? = null) : GameJoinActionErrors("No game with the given id was found", cause)
    class InitializePlayerError(cause: Throwable? = null) : GameJoinActionErrors("Failed to initialize the new player", cause)


    /**
     * Adds the given user as a new player to the game
     * @throws GameJoinActionErrors
     */
    suspend fun perform(userId: String, gameId: String)

}