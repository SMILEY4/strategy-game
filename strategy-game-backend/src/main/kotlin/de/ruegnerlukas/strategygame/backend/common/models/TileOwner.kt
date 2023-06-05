package de.ruegnerlukas.strategygame.backend.common.models

data class TileOwner(
    val countryId: String,
    val provinceId: String,
    val cityId: String?
)