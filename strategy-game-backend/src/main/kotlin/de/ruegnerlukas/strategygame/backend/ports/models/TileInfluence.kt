package de.ruegnerlukas.strategygame.backend.ports.models

data class TileInfluence(
    val countryId: String,
    val provinceId: String,
    val cityId: String,
    val amount: Double
)