package io.github.smiley4.strategygame.backend.worlds.ports.provided

import io.github.smiley4.strategygame.backend.common.models.GameSessionData


interface ListGames {

	suspend fun perform(userId: String): List<GameSessionData>

}