package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.utils.containedIn
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.commondata.BuildingProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.SettlerProductionQueueEntry


internal class CityPOVBuilder(
    private val povCache: POVCache,
    private val detailLogDTOBuilder: DetailLogPOVBuilder,
    private val povCountryId: String,
    private val provinces: List<Province>,
    private val routes: List<Route>
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
                                "type" to "building"
                                "entryId" to queueEntry.entryId
                                "progress" to calculateProductionQueueEntryProgress(queueEntry)
                                "buildingType" to queueEntry.buildingType.name
                            }
                            is SettlerProductionQueueEntry -> obj {
                                "type" to "settler"
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
            "connectedCities" to routes
                .filter { it.cityIdA == city.cityId || it.cityIdB == city.cityId }
                .filter { it.cityIdA.containedIn(povCache.knownCities()) && it.cityIdB.containedIn(povCache.knownCities()) }
                .map { route ->
                    obj {
                        "city" to if (route.cityIdA == city.cityId) route.cityIdB else route.cityIdA
                        "route" to route.routeId
                        "distance" to route.path.size
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