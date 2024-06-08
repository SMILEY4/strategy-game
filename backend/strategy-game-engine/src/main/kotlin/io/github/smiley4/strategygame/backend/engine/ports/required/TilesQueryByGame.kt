package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.common.models.Tile


interface TilesQueryByGame {
    suspend fun execute(gameId: String): List<Tile>
}