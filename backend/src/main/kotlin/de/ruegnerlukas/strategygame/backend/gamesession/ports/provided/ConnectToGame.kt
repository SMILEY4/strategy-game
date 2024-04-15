package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder.PlayerViewCreatorError

interface ConnectToGame {

    sealed class GameConnectActionError : Exception()
    class GameNotFoundError : GameConnectActionError()
    class InvalidPlayerState : GameConnectActionError()


    /**
     * Connect the given user to the given game
     * @throws GameConnectActionError
     * @throws PlayerViewCreatorError
     */
    suspend fun perform(userId: String, gameId: String, connectionId: Long)

}