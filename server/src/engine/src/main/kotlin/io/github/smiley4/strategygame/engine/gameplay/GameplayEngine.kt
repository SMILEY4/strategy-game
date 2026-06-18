package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

interface GameplayEngine {
    fun createGameState(gameId: GameId)
    suspend fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>, connectedPlayers: Collection<UserId>)
}

sealed class ProcessTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : ProcessTurnError("The game '$gameId' could not be found")
}
