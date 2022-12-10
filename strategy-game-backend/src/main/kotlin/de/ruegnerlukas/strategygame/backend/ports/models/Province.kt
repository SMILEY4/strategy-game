package de.ruegnerlukas.strategygame.backend.ports.models

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,
    var resourceBalance: MutableMap<ResourceType, Float>
)
