package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainType

data class TileData(
    var terrainType: TerrainType,
    var resourceType: TerrainResourceType,
)