package io.github.smiley4.strategygame.backend.common.models

import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType


data class TileData(
    var terrainType: TerrainType,
    var resourceType: TerrainResourceType,
)