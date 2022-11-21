package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class City(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isCity: Boolean,
    var parentCity: String?,
    val buildings: MutableList<Building>,
)
