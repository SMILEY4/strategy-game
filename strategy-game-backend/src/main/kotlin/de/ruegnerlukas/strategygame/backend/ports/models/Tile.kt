package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity

data class Tile(
    var gameId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableList<String>,
    val content: MutableList<TileContent>
) : DbEntity()
