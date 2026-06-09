package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

interface GameplayEngine {
    fun connect(gameId: GameId, userId: UserId)
    fun disconnect(gameId: GameId, userId: UserId)
    fun submitTurn(gameId: GameId, userId: UserId)
    fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>)
}

sealed class ProcessTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : ProcessTurnError("The game '$gameId' could not be found")
}
