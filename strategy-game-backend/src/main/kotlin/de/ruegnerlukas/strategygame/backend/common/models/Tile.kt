package de.ruegnerlukas.strategygame.backend.common.models

data class Tile(
    val tileId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableList<String>,
    val content: MutableList<TileContent>
)
