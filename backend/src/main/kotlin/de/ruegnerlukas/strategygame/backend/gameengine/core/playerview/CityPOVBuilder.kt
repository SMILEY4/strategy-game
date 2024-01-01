package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.utils.arrMap
import de.ruegnerlukas.strategygame.backend.common.utils.objMap
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry

class CityPOVBuilder(
    private val dtoCache: POVCache,
    private val detailLogDTOBuilder: DetailLogPOVBuilder,
    private val countryId: String,
    private val provinces: List<Province>
) {

    fun build(city: City): ObjectType? {
        if (!shouldInclude(city)) {
            return null
        }
        val province = provinces.find { it.cityIds.contains(city.cityId) }!!
        return obj {
            "dataTier1" to obj {
                "id" to city.cityId
                "name" to city.meta.name
                "color" to obj {
                    "red" to city.meta.color.red
                    "green" to city.meta.color.green
                    "blue" to city.meta.color.blue
                }
                "tile" to obj {
                    "id" to city.tile.tileId
                    "q" to city.tile.q
                    "r" to city.tile.r
                }
                "country" to dtoCache.countryIdentifier(city.countryId)
                "province" to dtoCache.provinceIdentifier(province.provinceId)
                "isCountryCapital" to false
                "isProvinceCapital" to city.meta.isProvinceCapital
                "tier" to city.tier.name
            }
            if (city.countryId == countryId) {
                "dataTier3" to obj {
                    "population" to obj {
                        "size" to city.population.size
                        "growthProgress" to city.population.growthProgress
                        "growthDetails" to detailLogDTOBuilder.build(city.population.growthDetailLog)
                    }
                    "buildings" to arrMap[city.infrastructure.buildings, { building ->
                        obj {
                            "type" to building.type.name
                            "active" to building.active
                            "tile" to objMap(building.tile) { tile ->
                                "id" to tile.tileId
                                "q" to tile.q
                                "r" to tile.r
                            }
                            "details" to detailLogDTOBuilder.build(building.details)
                        }
                    }]
                    "productionQueue" to arrMap[city.infrastructure.productionQueue, { queueEntry ->
                        obj {
                            "id" to queueEntry.entryId
                            "progress" to calculateProductionQueueEntryProgress(queueEntry)
                            when (queueEntry) {
                                is BuildingProductionQueueEntry -> {
                                    "buildingType" to queueEntry.buildingType.name
                                }
                                is SettlerProductionQueueEntry -> Unit
                            }
                        }
                    }]
                }
            }
        }
    }

    private fun shouldInclude(city: City): Boolean {
        return dtoCache.tileVisibility(city.tile.tileId) != VisibilityDTO.UNKNOWN
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