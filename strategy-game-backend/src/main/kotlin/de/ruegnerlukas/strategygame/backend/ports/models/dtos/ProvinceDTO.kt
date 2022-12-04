package de.ruegnerlukas.strategygame.backend.ports.models.dtos

data class ProvinceDTO(
    val provinceId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCapitalCityId: String,
    val dataTier3: ProvinceDataTier3?
)

data class ProvinceDataTier3(
    val balanceMoney: Float,
    val balanceFood: Float,
    val balanceWood: Float,
    val balanceStone: Float,
    val balanceIron: Float,
)
