package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.GameSessionData


interface ListGames {

    suspend fun perform(userId: String): List<GameSessionData>

}