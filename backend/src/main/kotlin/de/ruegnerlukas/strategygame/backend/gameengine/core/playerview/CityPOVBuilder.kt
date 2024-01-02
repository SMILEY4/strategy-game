package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.utils.notContainedIn
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry

class CityPOVBuilder(
    private val povCache: POVCache,
    private val detailLogDTOBuilder: DetailLogPOVBuilder,
    private val povCountryId: String,
    private val provinces: List<Province>
) {

    fun build(city: City): JsonType? {
        if (city.cityId.notContainedIn(povCache.knownCities())) {
            return null
        }
        val isPlayerOwned = city.countryId == povCountryId
        val province = provinces.find { it.cityIds.contains(city.cityId) }!!
        return obj {
            "id" to city.cityId
            "country" to city.countryId
            "province" to province.provinceId
            "tile" to povCache.tileIdentifier(city.tile.tileId)
            "isPlayerOwned" to isPlayerOwned
            "isProvinceCapital" to city.meta.isProvinceCapital
            "tier" to city.tier.name
            "infrastructure" to obj {
                "buildings" to objHidden(isPlayerOwned) {
                    city.infrastructure.buildings.map { building ->
                        obj {
                            "type" to building.type.name
                            "active" to building.active
                            "tile" to povCache.tileIdentifierOrNull(building.tile?.tileId)
                            "details" to detailLogDTOBuilder.build(building.details)
                        }
                    }
                }
                "productionQueue" to objHidden(isPlayerOwned) {
                    city.infrastructure.productionQueue.map { queueEntry ->
                        when (queueEntry) {
                            is BuildingProductionQueueEntry -> obj {
                                "entryId" to queueEntry.entryId
                                "progress" to calculateProductionQueueEntryProgress(queueEntry)
                                "buildingType" to queueEntry.buildingType.name
                            }
                            is SettlerProductionQueueEntry -> obj {
                                "entryId" to queueEntry.entryId
                                "progress" to calculateProductionQueueEntryProgress(queueEntry)
                            }
                        }
                    }
                }
            }
            "population" to obj {
                "size" to objHidden(isPlayerOwned) {
                    city.population.size
                }
                "growth" to objHidden(isPlayerOwned) {
                    obj {
                        "progress" to city.population.growthProgress
                        "details" to detailLogDTOBuilder.build(city.population.growthDetailLog)
                    }
                }
            }
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