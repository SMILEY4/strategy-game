package io.github.smiley4.strategygame.backend.sessions.turnend

import io.github.smiley4.strategygame.backend.commondata.Game

interface GameDbUpdate {
    suspend fun update(game: Game)
}