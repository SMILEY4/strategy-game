package io.github.smiley4.strategygame.backend.common.models

data class TileInfluence(
    val countryId: String,
    val provinceId: String,
    val cityId: String,
    val amount: Double
)