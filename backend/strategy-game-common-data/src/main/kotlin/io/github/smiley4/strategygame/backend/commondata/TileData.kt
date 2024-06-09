package io.github.smiley4.strategygame.backend.commondata

import io.github.smiley4.strategygame.backend.commondata.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.commondata.terrain.TerrainType


data class TileData(
    var terrainType: TerrainType,
    var resourceType: TerrainResourceType,
)