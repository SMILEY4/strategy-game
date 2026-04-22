package io.github.smiley4.strategygame.platform.game

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.domain.GameId

sealed class GameError(message: String?, cause: Throwable?) : Exception(message, cause) {
    class NotFound(value: String) : GameError("The game '$value' could not be found", null)
    class NotAllowed(user: UserId, game: GameId, operation: String) :
        GameError("The user '${user.id}' is not allowed to perform operation on game '${game.value}': $operation", null)
    class AlreadyMember(user: UserId, game: GameId) : GameError("The user '${user.id}' is already a player in game '${game.value}'", null)
}
