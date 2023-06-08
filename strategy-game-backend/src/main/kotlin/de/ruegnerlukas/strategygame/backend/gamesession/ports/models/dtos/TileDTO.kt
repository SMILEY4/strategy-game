package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

data class TileDTO(
    val dataTier0: TileDTODataTier0,
    val dataTier1: TileDTODataTier1?,
    val dataTier2: TileDTODataTier2?,
)

/**
 * The data that is always available
 */
data class TileDTODataTier0(
    val tileId: String,
    val position: TilePosition,
    val visibility: TileDTOVisibility,
)

/**
 * The data that is available for discovered and visible tiles
 */
data class TileDTODataTier1(
    val terrainType: String,
    val resourceType: String,
    val owner: TileDTOOwner?,
)

/**
 * The data that is available for visible tiles
 */
data class TileDTODataTier2(
    val influences: List<TileDTOInfluence>,
    val content: List<TileDTOContent>
)
