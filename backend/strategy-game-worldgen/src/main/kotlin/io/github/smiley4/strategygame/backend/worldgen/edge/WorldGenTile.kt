package io.github.smiley4.strategygame.backend.worldgen.edge

import io.github.smiley4.strategygame.backend.commondata.TerrainResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType


data class WorldGenTile(
    val q: Int,
    val r: Int,
    val type: TerrainType,
    val resource: TerrainResourceType
)
