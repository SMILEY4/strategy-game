package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.BuildingDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueBuildingEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ProductionQueueSettlerEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class CityDTOCreator {

    fun shouldInclude(city: City, tileDTOs: List<TileDTO>): Boolean {
        return tileDTOs.first { it.dataTier0.tileId == city.tile.tileId }.dataTier0.visibility != TileDTOVisibility.UNKNOWN
    }

    fun build(city: City): CityDTO {
        return CityDTO(
            cityId = city.cityId,
            countryId = city.countryId,
            tier = city.tier.name,
            tile = city.tile,
            name = city.meta.name,
            color = city.meta.color,
            isProvinceCapital = city.meta.isProvinceCapital,
            buildings = city.infrastructure.buildings.map { BuildingDTO(it.type.name, it.tile, it.active) },
            productionQueue = city.infrastructure.productionQueue.map { buildProductionQueueEntry(it) },
            size = city.population.size,
            growthProgress = city.population.growthProgress
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
        if (totalRequired < 0.0001) {
            return 1f
        } else {
            return totalCollected / totalRequired
        }
    }

}