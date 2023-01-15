package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedger
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route

/**
 * Updates the market and trade
 * - triggered by [GameEventResourcesUpdate]
 * - triggers nothing
 */
class GameActionMarketUpdate : GameAction<GameEventResourcesUpdate>(GameEventResourcesUpdate.TYPE) {

    override suspend fun perform(event: GameEventResourcesUpdate): List<GameEvent> {
        val cityNetworks = calculateNetworks(event.game.routes)
        cityNetworks.forEach { network ->
            println("==== NETWORK ===============")
            val provinces = network.map { getProvinceByCity(event.game, it) }.toSet()
            val networkAvgAvailable = getAverageAvailableResources(provinces)
            println("  NETWORK:")
            networkAvgAvailable.forEach { (type, avg) ->
                println("    - $type: avg = $avg")
            }
            provinces.forEach { province ->
                val available = getAvailableResources(province)
                val required = getTotalRequiredResources(event.game, province)
                val demand = networkAvgAvailable
                    .map { (type, avg) -> type to (-(1f / (avg / available[type]!!)) + 1f) }
                    .associate { it }
                province.resourceAvailability.also {
                    it.clear()
                    it.putAll(available)
                }
                province.resourceRequirement.also {
                    it.clear()
                    it.putAll(required)
                }
                province.resourceDemands.also {
                    it.clear()
                    it.putAll(demand)
                }
                println("  PROVINCE ${getCity(event.game, province.provinceCapitalCityId).name}")
                networkAvgAvailable.forEach { (type, avg) ->
                    println("    - $type: available = ${available[type]},  required = ${required[type]},  demand = ${demand[type]}")
                }
            }
            calculateTradeRoutes(event.game, network)
        }
        return listOf()
    }

    private fun getAverageAvailableResources(provinces: Collection<Province>): Map<ResourceType, Float> {
        val avg = mutableMapOf<ResourceType, Float>()
        provinces.forEach { province ->
            getAvailableResources(province).forEach { availableResource ->
                if (!avg.containsKey(availableResource.key)) {
                    avg[availableResource.key] = availableResource.value
                } else {
                    avg[availableResource.key] = (avg[availableResource.key]!! + availableResource.value) / 2
                }
            }
        }
        return avg
    }

    private fun getAvailableResources(province: Province): Map<ResourceType, Float> {
        return ResourceType.values().associateWith { province.resourceLedgerPrevTurn.getChangeInput(it) }
    }

    private fun getTotalRequiredResources(game: GameExtended, province: Province): Map<ResourceType, Float> {
        val resources = ResourceType.values().associateWith { 0f }.toMutableMap()

        // food consumption
        resources[ResourceType.FOOD] = resources[ResourceType.FOOD]!! + (province.resourceLedgerPrevTurn.getEntriesOutput(ResourceType.FOOD)
            .find { it.reason == ResourceLedger.reasonPopulationFoodConsumption() }?.change ?: 0f)

        // building production
        province.cityIds.map { getCity(game, it) }.forEach { city ->
            city.buildings
                .filter { it.type.templateData.requiredTileResource == null || it.tile != null }
                .forEach { building ->
                    building.type.templateData.requires.forEach { reqResource ->
                        resources[reqResource.type] = resources[reqResource.type]!! + reqResource.amount
                    }
                }
        }

        return resources

    }

    private fun calculateNetworks(routes: Collection<Route>): List<Set<String>> {
        val networks = mutableListOf<MutableSet<String>>()
        routes.forEach { route ->
            val networkA = networks.find { network -> network.contains(route.cityIdA) }
            val networkB = networks.find { network -> network.contains(route.cityIdB) }
            // both cities do not exist an any network
            if (networkA == null && networkB == null) {
                networks.add(mutableSetOf(route.cityIdA, route.cityIdB))
            }
            // only city "a" already exists in some network
            if (networkA != null && networkB == null) {
                networkA.add(route.cityIdB)
            }
            // only city "b" already exists in some network
            if (networkA == null && networkB != null) {
                networkB.add(route.cityIdA)
            }
            // both cities already exist in different networks
            if (networkA != null && networkB != null && networkA != networkB) {
                val merged = mutableSetOf<String>().also {
                    it.addAll(networkA)
                    it.addAll(networkB)
                }
                networks.remove(networkA)
                networks.remove(networkB)
                networks.add(merged)
            }
        }
        return networks
    }


    private fun calculateTradeRoutes(game: GameExtended, network: Collection<String>) {
        /*
         * - for each combination of two provinces/nodes "a", "b", in network "n":
         *      - find the shortest trade routes "a-b", "b-a" by pathfinding over the existing routes in network "n"
         * - rate + sort all trade routes (depending on demand of "a","b")
         * - try to add the highest rated trade routes (for each route, check if start-province has free slot)
         */

        val provinces = network.map { getProvinceByCity(game, it) }.toSet()
        provinces
            .sortedByDescending { it.resourceAvailability.values.average() }
            .forEach { provinceA ->
                provinces
                    .asSequence()
                    .filter { it != provinceA }
                    .flatMap { provinceB ->
                        TODO("map to trade routes a-b, b-a")
                        listOf<TradeRoute>()
                    }
            }
    }


    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }

    private fun getProvinceByCity(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) }!!
    }

}

data class TradeRoute(
    val from: Province,
    val to: Province,
    val routes: Route
)








