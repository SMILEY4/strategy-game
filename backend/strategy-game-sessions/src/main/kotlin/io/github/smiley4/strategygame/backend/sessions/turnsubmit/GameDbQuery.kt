package io.github.smiley4.strategygame.backend.sessions.turnsubmit

import io.github.smiley4.strategygame.backend.commondata.Game

interface GameDbQuery {
    suspend fun query(game: Game.Id): Game
}