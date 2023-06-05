package de.ruegnerlukas.strategygame.backend.worldcreation

import de.ruegnerlukas.strategygame.backend.common.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.common.models.TileType

data class WorldTile(
    val q: Int,
    val r: Int,
    val type: TileType,
    val resource: TileResourceType
)
