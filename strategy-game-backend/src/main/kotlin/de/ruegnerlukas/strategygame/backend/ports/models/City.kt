package de.ruegnerlukas.strategygame.backend.ports.models

class City(
    val cityId: String,
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val city: Boolean,
    var parentCity: String?,
    val buildings: MutableList<Building>,
)
