package io.github.smiley4.strategygame.backend.worldgen.lib

import io.github.smiley4.strategygame.backend.commondata.ResourceNode
import io.github.smiley4.strategygame.backend.commondata.TerrainType


data class WorldGenTile(
    val q: Int,
    val r: Int,
    val height: Float,
    val type: TerrainType,
    val resources: List<ResourceNode>
)
