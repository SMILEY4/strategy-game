package io.github.smiley4.strategygame.backend.sessions.connect


sealed class GameConnectError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class GameNotFoundError(cause: Throwable? = null) : GameConnectError("The game with the given id does not exist", cause)
}
