package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.pathfinding.routebased.RouteBasedPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route

/**
 * Updates the market and trade
 * - triggered by [GameEventResourcesUpdate]
 * - triggers nothing
 */
class GameActionMarketUpdate : GameAction<GameEventResourcesUpdate>(GameEventResourcesUpdate.TYPE) {

	companion object {

		private data class BundledTradeRoute(
			val src: Province,
			val dst: Province,
			val routes: List<Route>,
			var rating: Map<ResourceType, Float> = mapOf()
		)

		private data class TradeRoute(
			val src: Province,
			val dst: Province,
			val routes: List<Route>,
			val resourceType: ResourceType,
			val rating: Float
		)

	}

	override suspend fun perform(event: GameEventResourcesUpdate): List<GameEvent> {
		val cityNetworks = calculateNetworks(event.game.routes)
		cityNetworks.forEach { network ->
			println("==== NETWORK ===============")
			val provinces = network.map { getProvinceByCity(event.game, it) }.toSet()
			val networkAvgDemand = getAverageResourceBalance(provinces)
			println("  NETWORK:")
			networkAvgDemand.forEach { (type, avg) ->
				println("    - $type: avg = $avg")
			}
			provinces.forEach { province ->
				val balance = getResourceBalance(province)
				val demand = ResourceType.values().map { it to calcDemand(it, networkAvgDemand, balance) }.associate { it }
				province.resourceBalance.also {
					it.clear()
					it.putAll(balance)
				}
				province.resourceDemands.also {
					it.clear()
					it.putAll(demand)
				}
				println("  PROVINCE ${getCity(event.game, province.provinceCapitalCityId).name}")
				networkAvgDemand.forEach { (type, avg) ->
					println("    - $type: avg=${avg}, available = ${balance[type]}, demand = ${demand[type]}")
				}
			}
			val allTradeRoutes = calculateAllTradeRoutes(event.game, network).sortedByDescending { it.rating }
			println("ROUTES")
			allTradeRoutes
				.take(10)
				.map { "${it.src.provinceId}-${it.dst.provinceId}: ${it.resourceType}=${it.rating}" }
				.forEach { println(it) }

		}
		return listOf()
	}

	private fun calcDemand(type: ResourceType, avg: Map<ResourceType, Float>, balance: Map<ResourceType, Float>): Float {
		return avg[type]!! - balance[type]!!
	}

	private fun getAverageResourceBalance(provinces: Collection<Province>): Map<ResourceType, Float> {
		val avg = mutableMapOf<ResourceType, MutableList<Float>>()
		provinces.forEach { province ->
			getResourceBalance(province).forEach { balance ->
				if (!avg.containsKey(balance.key)) {
					avg[balance.key] = mutableListOf(balance.value)
				} else {
					avg[balance.key]!!.add(balance.value)
				}
			}
		}
		return avg.mapValues { it.value.average().toFloat() }
	}

	private fun getResourceBalance(province: Province): Map<ResourceType, Float> {
		return ResourceType.values().associateWith { province.resourceLedgerPrevTurn.getChangeTotal(it) }
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


	private fun calculateAllTradeRoutes(game: GameExtended, network: Collection<String>): List<TradeRoute> {
		val provinces = network.map { getProvinceByCity(game, it) }.toSet()
		val routes = game.routes.filter { network.contains(it.cityIdA) || network.contains(it.cityIdB) }
		println("calculating all possible trade routes (provinces:${provinces.size},routes:${routes.size})...")
		return provinces
			.flatMap { provinceA ->
				provinces
					.asSequence()
					.filter { it != provinceA }
					.flatMap { provinceB ->
						val routesAB = getRoutesPath(provinceA, provinceB, routes)
						val routesBA = routesAB.reversed()
						listOf(
							BundledTradeRoute(provinceA, provinceB, routesAB),
							BundledTradeRoute(provinceB, provinceA, routesBA)
						)
					}
					.filter { it.routes.isNotEmpty() }
					.onEach { bundledTradeRoute -> bundledTradeRoute.rating = getRating(bundledTradeRoute) }
					.flatMap { bundledTradeRoute ->
						bundledTradeRoute.rating.entries
							.asSequence()
							.filter { it.value > 0 }
							.map { TradeRoute(bundledTradeRoute.src, bundledTradeRoute.dst, bundledTradeRoute.routes, it.key, it.value) }
					}
			}
	}


	private fun getRoutesPath(a: Province, b: Province, routes: List<Route>): List<Route> {
		return RouteBasedPathfinder().find(a.provinceCapitalCityId, b.provinceCapitalCityId, routes)
	}


	private fun getRating(tradeRoute: BundledTradeRoute): Map<ResourceType, Float> {
		val demandsSrc = tradeRoute.src.resourceDemands
		val demandsDst = tradeRoute.dst.resourceDemands
		return ResourceType.values().associateWith { resourceType ->
			val demandSrc = demandsSrc[resourceType] ?: 0f
			val demandDst = demandsDst[resourceType] ?: 0f
			val balanceSrc = tradeRoute.src.resourceLedgerPrevTurn.getChangeTotal(resourceType)
			if (balanceSrc <= 0 || demandSrc > demandDst) {
				-1f
			} else {
				demandDst - demandSrc
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
