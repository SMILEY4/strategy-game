package de.ruegnerlukas.strategygame.backend.ports.models

data class TileData(
    var terrainType: TileType,
    var resourceType: TileResourceType,
)