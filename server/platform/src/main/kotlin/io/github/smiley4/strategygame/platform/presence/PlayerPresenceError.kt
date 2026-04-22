package io.github.smiley4.strategygame.platform.presence

import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId

sealed class PlayerPresenceError(message: String?, cause: Throwable?) : Exception(message, cause) {
    class AlreadyConnected(user: UserId) : PlayerPresenceError("The user '${user.id}' is already connected to a game", null)
    class GameNotFound(user: UserId, game: GameId) : PlayerPresenceError("The game '${game.value}' could not be found for user '${user.id}'", null)
    class NotMember(user: UserId, game: GameId) : PlayerPresenceError("The user '${user.id}' is not a member of game '${game.value}'", null)
    class NotConnected(user: UserId) : PlayerPresenceError("The user '${user.id}' is not connected to any game", null)
}
