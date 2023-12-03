package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.detaillog.dto.DetailLogEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.BuildingDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDataTier1
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDataTier3
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueBuildingEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueSettlerEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class CityDTOCreator(private val countryId: String) {

    fun shouldInclude(city: City, tileDTOs: List<TileDTO>): Boolean {
        return tileDTOs.first { it.dataTier0.tileId == city.tile.tileId }.dataTier0.visibility != TileDTOVisibility.UNKNOWN
    }

    fun build(city: City): CityDTO {
        return CityDTO(
            dataTier1 = CityDataTier1(
                id = city.cityId,
                name = city.meta.name,
                color = city.meta.color,
                countryId = city.countryId,
                isCountryCapital = false,
                isProvinceCapital = city.meta.isProvinceCapital,
                tile = city.tile,
                tier = city.tier.name
            ),
            dataTier3 = if (countryId == city.countryId) {
                CityDataTier3(
                    buildings = city.infrastructure.buildings.map { building ->
                        BuildingDTO(
                            type = building.type.name,
                            tile = building.tile,
                            active = building.active,
                            details = building.details.getDetails().map { DetailLogEntryDTO.of(it) }
                        )
                    },
                    productionQueue = city.infrastructure.productionQueue.map { buildProductionQueueEntry(it) },
                    size = city.population.size,
                    growthProgress = city.population.growthProgress,
                    growthDetails = city.population.growthDetailLog.getDetails().map { DetailLogEntryDTO.of(it) }
                )
            } else {
                null
            }
        )
    }

    private fun buildProductionQueueEntry(entry: ProductionQueueEntry): ProductionQueueEntryDTO {
        return when (entry) {
            is BuildingProductionQueueEntry -> ProductionQueueBuildingEntryDTO(
                entryId = entry.entryId,
                progress = calculateProductionQueueEntryProgress(entry),
                buildingType = entry.buildingType
            )
            is SettlerProductionQueueEntry -> ProductionQueueSettlerEntryDTO(
                entryId = entry.entryId,
                progress = calculateProductionQueueEntryProgress(entry),
            )
        }
    }

    private fun calculateProductionQueueEntryProgress(entry: ProductionQueueEntry): Float {
        val totalRequired = entry.getTotalRequiredResources().toStacks().fold(0f) { a, b -> a + b.amount }
        val totalCollected = entry.collectedResources.toList().fold(0f) { a, b -> a + b.second }
        return if (totalRequired < 0.0001) {
            1f
        } else {
            totalCollected / totalRequired
        }
    }

}