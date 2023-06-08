package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

data class TileDTOOwner(
    val countryId: String,
    val provinceId: String,
    val cityId: String?
)