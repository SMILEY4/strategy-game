package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

data class TileInfluence(
    val countryId: String,
    val provinceId: String,
    val cityId: String,
    val amount: Double
)