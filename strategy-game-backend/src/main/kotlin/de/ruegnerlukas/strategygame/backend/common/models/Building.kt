package de.ruegnerlukas.strategygame.backend.common.models

class Building(
    val type: BuildingType,
    val tile: TileRef?,
    var active: Boolean,
)