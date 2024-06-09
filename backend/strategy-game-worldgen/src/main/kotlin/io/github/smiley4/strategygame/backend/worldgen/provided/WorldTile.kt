package io.github.smiley4.strategygame.backend.worldgen.provided

import io.github.smiley4.strategygame.backend.commondata.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.commondata.terrain.TerrainType


data class WorldTile(
    val q: Int,
    val r: Int,
    val type: TerrainType,
    val resource: TerrainResourceType
)
