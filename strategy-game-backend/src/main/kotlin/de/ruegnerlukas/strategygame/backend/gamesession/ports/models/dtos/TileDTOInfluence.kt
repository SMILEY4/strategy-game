package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

data class TileDTOInfluence(
    val countryId: String,
    val provinceId: String,
    val cityId: String,
    val amount: Double
)