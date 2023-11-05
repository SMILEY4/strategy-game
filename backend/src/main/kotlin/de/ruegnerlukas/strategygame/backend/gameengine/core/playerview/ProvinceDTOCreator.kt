package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProvinceDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProvinceDataTier1
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProvinceDataTier3

class ProvinceDTOCreator(private val countryId: String) {

    fun shouldInclude(province: Province, cityDTOs: List<CityDTO>): Boolean {
        return province.cityIds.any { provinceCityId -> cityDTOs.find { it.dataTier1.id == provinceCityId } != null }
    }

    fun build(province: Province): ProvinceDTO {
        return ProvinceDTO(
            dataTier1 = ProvinceDataTier1(
                id = province.provinceId,
                name = province.provinceId, // todo: store proper name
                countryId = province.countryId,
                color = RGBColor.random(), // todo: store proper color
                cityIds = province.cityIds,
                provinceCapitalCityId = province.provinceCapitalCityId,
            ),
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