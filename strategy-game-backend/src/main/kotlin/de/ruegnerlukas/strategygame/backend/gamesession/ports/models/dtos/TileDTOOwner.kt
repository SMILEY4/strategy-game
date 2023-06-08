package de.ruegnerlukas.strategygame.backend.common.models.dtos

data class TileDTOOwner(
    val countryId: String,
    val provinceId: String,
    val cityId: String?
)