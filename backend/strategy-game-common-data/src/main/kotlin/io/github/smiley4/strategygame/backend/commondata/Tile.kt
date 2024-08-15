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
    val discoveredByCountries: MutableSet<String>,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
)