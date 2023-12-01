package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.detaillog.dto.DetailLogEntryDTO
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
                color = province.color,
                cityIds = province.cityIds,
                provinceCapitalCityId = province.provinceCapitalCityId,
            ),
            dataTier3 = if (countryId == province.countryId) {
                ProvinceDataTier3(
                    resourceLedger = ResourceLedgerDTO(
                        entries = province.resourceLedger.getEntries().map { entry ->
                            ResourceLedgerEntryDTO(
                                resourceType = entry.resourceType,
                                amount = entry.amount,
                                missing = entry.missing,
                                details = entry.getDetails().map { DetailLogEntryDTO.of(it) }
                            )
                        }
                    )
                )
            } else {
                null
            }
        )
    }

}