package de.ruegnerlukas.strategygame.backend.core.world

import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType

data class WorldTile(
    val q: Int,
    val r: Int,
    val type: TileType,
    val resource: TileResourceType
)
