package io.github.smiley4.strategygame.backend.sessions.delete

import io.github.smiley4.strategygame.backend.commondata.Game

interface GameDbDelete {
    suspend fun delete(game: Game.Id)
}