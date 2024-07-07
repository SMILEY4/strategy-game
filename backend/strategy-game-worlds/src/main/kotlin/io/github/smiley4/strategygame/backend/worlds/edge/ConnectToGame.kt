package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Connect a user to a game
 */
interface ConnectToGame {

    sealed class GameConnectActionError(message: String?, cause: Throwable? = null) : Exception(message, cause)
    class GameNotFoundError(cause: Throwable? = null) : GameConnectActionError("The game with the given id does not exist", cause)
    class InvalidPlayerState(cause: Throwable? = null) : GameConnectActionError("The player is in an invalid connection-state", cause)

    /**
     * @param userId the id of the user to connect
     * @param gameId the id of the game to connect to
     * @param connectionId the id of the open connection to the user
     * @throws GameConnectActionError
     */
    suspend fun perform(userId: String, gameId: String, connectionId: Long)

}