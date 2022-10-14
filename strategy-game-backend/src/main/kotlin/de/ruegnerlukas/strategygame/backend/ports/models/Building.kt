package de.ruegnerlukas.strategygame.backend.ports.models

data class Building(
    val type: BuildingType,
    val tile: TileRef?
)