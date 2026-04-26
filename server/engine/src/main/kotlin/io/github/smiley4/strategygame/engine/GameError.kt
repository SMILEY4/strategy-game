package io.github.smiley4.strategygame.engine

import io.github.smiley4.strategygame.shared.domain.UserId

sealed class GameError(message: String?, cause: Throwable?) : Exception(message, cause) {
    class NotFound(gameId: String) : GameError("The game '$gameId' could not be found", null)
    class NotParticipant(user: UserId, gameId: String) : GameError("The user '${user.id}' is not a participant of game $gameId", null)
    class AlreadySubmitted(user: UserId, gameId: String) : GameError("The user '${user.id}' has already submitted their turn for game $gameId", null)
}