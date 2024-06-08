package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.common.models.Tile


interface TilesInsert {
    suspend fun insert(tiles: Collection<Tile>, gameId: String)
}