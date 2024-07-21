package io.github.smiley4.strategygame.backend.worldgen.edge

import io.github.smiley4.strategygame.backend.commondata.TileResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType


data class WorldGenTile(
    val q: Int,
    val r: Int,
    val height: Float,
    val type: TerrainType,
    val resource: TileResourceType
)
