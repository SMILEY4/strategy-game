package io.github.smiley4.strategygame.backend.worldgen

import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType


data class WorldTile(
    val q: Int,
    val r: Int,
    val type: TerrainType,
    val resource: TerrainResourceType
)
