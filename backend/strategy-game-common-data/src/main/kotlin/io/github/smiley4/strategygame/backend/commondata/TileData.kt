package io.github.smiley4.strategygame.backend.commondata


data class TileData(
    var terrainType: TerrainType,
    var resourceType: TileResourceType,
    var height: Float,
)