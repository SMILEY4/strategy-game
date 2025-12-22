package io.github.smiley4.strategygame.backend.sessions.turnsubmit


sealed class GameTurnSubmitError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NotParticipantError(cause: Throwable? = null) : GameTurnSubmitError("The given user is not a player in the game", cause)
    class GameNotFoundError(cause: Throwable? = null) : GameTurnSubmitError("No game with the given id could be found", cause)
    class EndTurnError(cause: Throwable? = null) : GameTurnSubmitError("Failed to properly end the turn", cause)
}
