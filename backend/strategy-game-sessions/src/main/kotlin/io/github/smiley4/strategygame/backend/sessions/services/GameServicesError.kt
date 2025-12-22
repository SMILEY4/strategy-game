package io.github.smiley4.strategygame.backend.sessions.services

sealed class GameServicesError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class GameNotFoundError(cause: Throwable? = null) : GameServicesError("The game with the given id does not exist", cause)
    class WorldObjectNotFoundError(cause: Throwable? = null) : GameServicesError("The world-object with the given id does not exist", cause)
    class TileNotFoundError(cause: Throwable? = null) : GameServicesError("The tile with the given id does not exist", cause)
}