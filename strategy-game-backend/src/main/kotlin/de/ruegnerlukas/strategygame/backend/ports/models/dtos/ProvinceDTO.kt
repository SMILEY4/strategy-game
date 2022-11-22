package de.ruegnerlukas.strategygame.backend.ports.models.dtos

data class ProvinceDTO(
    val provinceId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCapitalCityId: String
)
