package de.ruegnerlukas.strategygame.backend.ports.models

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCityId: String
)
