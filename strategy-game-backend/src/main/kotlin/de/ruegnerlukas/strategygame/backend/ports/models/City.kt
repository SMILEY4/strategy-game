package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity

class City(
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val city: Boolean,
    var parentCity: String?,
    val buildings: MutableList<Building>,
    key: String? = null,
) : DbEntity(key)
