package io.github.smiley4.strategygame.backend.sessions.turnend

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.Game

interface GameDbCommandsQuery {
    suspend fun query(game: Game.Id, turn: Int): List<Command<*>>
}