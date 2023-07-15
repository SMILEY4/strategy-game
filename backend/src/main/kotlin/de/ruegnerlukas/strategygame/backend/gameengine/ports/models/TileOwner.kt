package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

data class TileOwner(
    val countryId: String,
    val provinceId: String,
    val cityId: String?
)