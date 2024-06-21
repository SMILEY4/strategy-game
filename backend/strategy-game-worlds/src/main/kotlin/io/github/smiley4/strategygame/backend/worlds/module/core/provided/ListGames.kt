package io.github.smiley4.strategygame.backend.worlds.module.core.provided

import io.github.smiley4.strategygame.backend.commondata.GameSessionData


interface ListGames {

    suspend fun perform(userId: String): List<GameSessionData>

}