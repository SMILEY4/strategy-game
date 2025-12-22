package io.github.smiley4.strategygame.backend.sessions.connect

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState

interface GameDbStateQuery {
    suspend fun query(gameId: Game.Id): GameState
}