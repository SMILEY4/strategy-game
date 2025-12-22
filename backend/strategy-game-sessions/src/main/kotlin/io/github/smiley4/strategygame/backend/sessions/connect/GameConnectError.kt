package io.github.smiley4.strategygame.backend.sessions.connect


sealed class GameConnectError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NotParticipantError(cause: Throwable? = null) : GameConnectError("The player is not a participant in the game", cause)
    class AlreadyConnectedError(cause: Throwable? = null) : GameConnectError("The player is already connected to the game", cause)
    class GameNotFoundError(cause: Throwable? = null) : GameConnectError("The game with the given id does not exist", cause)
    class InvalidPlayerState(cause: Throwable? = null) : GameConnectError("The player is in an invalid connection-state", cause)
}
