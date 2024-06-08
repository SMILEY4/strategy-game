package io.github.smiley4.strategygame.backend.worlds.ports.provided


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