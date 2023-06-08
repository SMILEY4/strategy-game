package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

data class ProvinceDTO(
    val provinceId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCapitalCityId: String,
    val dataTier3: ProvinceDataTier3?,
)

data class ProvinceDataTier3(
    val resourceBalance: Map<ResourceType, Float>
)
