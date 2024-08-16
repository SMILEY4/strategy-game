package io.github.smiley4.strategygame.backend.commondata

data class Tile(
    val tileId: String,
    val position: TilePosition,
    val dataWorld: TileWorldData,
    val dataPolitical: TilePoliticalData,
)

data class TileWorldData(
    var terrainType: TerrainType,
    var resourceType: TileResourceType,
    var height: Float,
)

data class TilePoliticalData(
    val influences: MutableList<TileInfluence>,
    val discoveredByCountries: MutableSet<String>,
    var controlledBy: TileOwner?
)

data class TileOwner(
    val countryId: String,
    val provinceId: String,
    val settlementId: String
)