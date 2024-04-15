package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

interface RequestConnectionToGame {

    sealed class GameRequestConnectionActionError : Exception()
    class GameNotFoundError : GameRequestConnectionActionError()
    class NotParticipantError : GameRequestConnectionActionError()
    class AlreadyConnectedError : GameRequestConnectionActionError()


    /**
     * Checks if the given user is allowed to connect to the game
     * @throws GameRequestConnectionActionError
     */
    suspend fun perform(userId: String, gameId: String)

}