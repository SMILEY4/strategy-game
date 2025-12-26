package io.github.smiley4.strategygame.backend.sessions.eventstoken

sealed class EventsTokenGetError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class GameNotFoundError(cause: Throwable? = null) : EventsTokenGetError("No game with the given id was found", cause)
    class NotParticipantError(cause: Throwable? = null) : EventsTokenGetError("The player is not a participant in the game", cause)
}