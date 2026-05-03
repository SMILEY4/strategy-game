package io.github.smiley4.strategygame.engine.domain

import io.github.smiley4.strategygame.engine.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId

interface GameplayEngine {
    fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>)
}

sealed class ProcessTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : ProcessTurnError("The game '$gameId' could not be found")
}
