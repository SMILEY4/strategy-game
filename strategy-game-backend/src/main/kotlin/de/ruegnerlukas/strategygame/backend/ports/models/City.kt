package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class City(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: MutableList<Building>,
)