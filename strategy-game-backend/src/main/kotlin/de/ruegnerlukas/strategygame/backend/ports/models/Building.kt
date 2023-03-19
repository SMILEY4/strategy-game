package de.ruegnerlukas.strategygame.backend.ports.models

class Building(
    val type: BuildingType,
    val tile: TileRef?,
    var active: Boolean,
)