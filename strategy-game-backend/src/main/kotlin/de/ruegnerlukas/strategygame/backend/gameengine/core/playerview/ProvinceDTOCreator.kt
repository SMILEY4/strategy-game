package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProvinceDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProvinceDataTier3

class ProvinceDTOCreator(private val countryId: String) {

    fun shouldInclude(province: Province, cityDTOs: List<CityDTO>): Boolean {
        return province.cityIds.any { provinceCityId -> cityDTOs.find { it.cityId == provinceCityId } != null }
    }

    fun build(province: Province): ProvinceDTO {
        return ProvinceDTO(
            provinceId = province.provinceId,
            countryId = province.countryId,
            cityIds = province.cityIds,
            provinceCapitalCityId = province.provinceCapitalCityId,
            dataTier3 = if (countryId == province.countryId) {
                ProvinceDataTier3(
                    resourceBalance = ResourceType.values().associateWith { type ->
                        province.resourcesProducedPrevTurn[type] - province.resourcesConsumedCurrTurn[type]
                    }
                )
            } else {
                null
            }
        )
    }

}