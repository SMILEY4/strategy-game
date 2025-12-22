package io.github.smiley4.strategygame.backend.sessions.create

import io.github.smiley4.strategygame.backend.commondata.Game

interface GameDbInsert {

    suspend fun insert(game: Game): String

}