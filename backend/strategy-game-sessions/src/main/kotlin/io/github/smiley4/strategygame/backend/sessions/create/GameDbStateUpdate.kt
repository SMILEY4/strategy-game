package io.github.smiley4.strategygame.backend.sessions.create

import io.github.smiley4.strategygame.backend.commondata.GameState

interface GameDbStateUpdate {

    suspend fun update(gameState: GameState)

}