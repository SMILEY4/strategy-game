package io.github.smiley4.strategygame.backend.sessions.turnend


sealed class GameTurnEndError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class GameNotFoundError(cause: Throwable? = null) : GameTurnEndError("No game with the given id could be found", cause)
    class GameStepError(cause: Throwable? = null) : GameTurnEndError("The game step could not be performed", cause)
}
