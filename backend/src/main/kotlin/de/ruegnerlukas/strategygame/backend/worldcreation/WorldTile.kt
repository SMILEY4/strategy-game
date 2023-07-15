package de.ruegnerlukas.strategygame.backend.worldcreation

import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainType

data class WorldTile(
    val q: Int,
    val r: Int,
    val type: TerrainType,
    val resource: TerrainResourceType
)
