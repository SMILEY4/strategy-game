package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User

/**
 * Checks if a user is allowed to connect to a game
 */
interface RequestConnectionToGame {

    sealed class GameRequestConnectionActionError(message: String, cause: Throwable? = null) : Exception(message, cause)

    class GameNotFoundError(cause: Throwable? = null)
        : GameRequestConnectionActionError("No game with the given id could be found", cause)

    class NotParticipantError(cause: Throwable? = null)
        : GameRequestConnectionActionError("The given user is not a player in the given game", cause)

    class AlreadyConnectedError(cause: Throwable? = null)
        : GameRequestConnectionActionError("The given user is already currently connected to the given game", cause)


    /**
     * Checks if the given user is allowed to connect to the game
     * @throws GameRequestConnectionActionError
     */
    suspend fun perform(userId: User.Id, gameId: Game.Id)

}