package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType

class Building(
    val type: BuildingType,
    val tile: TileRef?,
    var active: Boolean,
)