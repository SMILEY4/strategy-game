package io.github.smiley4.strategygame.backend.sessions.join


sealed class GameJoinError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class UserAlreadyJoinedError(cause: Throwable? = null) : GameJoinError("The user is already a player in the given game", cause)
    class GameNotFoundError(cause: Throwable? = null) : GameJoinError("No game with the given id was found", cause)
    class InitializePlayerError(cause: Throwable? = null) : GameJoinError("Failed to initialize the new player", cause)
}