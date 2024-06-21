package io.github.smiley4.strategygame.backend.common.data

import io.github.smiley4.strategygame.backend.commondata.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.data.terrain.TerrainType


data class TileData(
    var terrainType: io.github.smiley4.strategygame.backend.common.data.terrain.TerrainType,
    var resourceType: TerrainResourceType,
)