package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.pathfinding.routebased.RouteBasedPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.TradeRoute

/**
 * Updates the market and trade
 * - triggered by [GameEventResourcesUpdate]
 * - triggers nothing
 */
class GameActionMarketUpdate() : GameAction<GameEventResourcesUpdate>(GameEventResourcesUpdate.TYPE) {

	companion object {

		private const val BASE_TRADE_ROUTES = 1
		private const val TRADE_ROUTES_PER_MARKED = 2

		private data class BundledTradeRoute(
			val src: Province,
			val dst: Province,
			val routes: List<Route>,
			var rating: Map<ResourceType, Float> = mapOf()
		)

	}

	override suspend fun perform(event: GameEventResourcesUpdate): List<GameEvent> {
		MarketNetwork.networksFrom(event.game).forEach {
			updateBalanceAndDemand(it)
			createPossibleTradeRoutes(event.game, it)
		}
		return listOf()
	}

	private fun updateBalanceAndDemand(network: MarketNetwork) {
		val networkAvgBalance = network.getAverageResourceBalance()
		network.getProvinces().forEach { province ->
			val balance = MarketUtils.getResourceBalance(province)
			val demand = MarketUtils.getDemand(networkAvgBalance, balance)
			province.resourceBalance.also {
				it.clear()
				it.putAll(balance.toMap())
			}
			province.resourceDemands.also {
				it.clear()
				it.putAll(demand.toMap())
			}
		}
	}

	private fun createPossibleTradeRoutes(game: GameExtended, network: MarketNetwork) {
		network.getProvinces().forEach { province ->
			val freeTradeRouteCount = getFreeTradeRouteCount(game, province)
			if (freeTradeRouteCount > 0) {
				val tradeRoutes = createTradeRoute(province, network, freeTradeRouteCount, game.game.turn)
				province.tradeRoutes.addAll(tradeRoutes)
			}
		}
	}

	private fun getFreeTradeRouteCount(game: GameExtended, province: Province): Int {
		val marketCount = province.cityIds
			.asSequence()
			.map { getCity(game, it) }
			.flatMap { it.buildings }
			.filter { it.type == BuildingType.MARKET }
			.filter { it.active }
			.count()
		val tradeRouteCount = countTradeRoutes(province)
		return (BASE_TRADE_ROUTES + marketCount * TRADE_ROUTES_PER_MARKED) - tradeRouteCount
	}

	private fun createTradeRoute(provinceOwning: Province, network: MarketNetwork, amount: Int, turn: Int): List<TradeRoute> {
		return network
			.getProvinces()
			.asSequence()
			.filter { it != provinceOwning }
			.flatMap { provincePartner ->
				val pathAB = getRoutesPath(provinceOwning, provincePartner, network.getRoutes())
				val pathBA = pathAB.reversed()
				listOf(
					BundledTradeRoute(provinceOwning, provincePartner, pathAB),
					BundledTradeRoute(provincePartner, provinceOwning, pathBA)
				)
			}
			.filter { it.routes.isNotEmpty() }
			.onEach { bundledTradeRoute -> bundledTradeRoute.rating = getRating(bundledTradeRoute) }
			.flatMap { bundledTradeRoute ->
				bundledTradeRoute.rating.entries
					.asSequence()
					.filter { (_, rating) -> rating > 0 }
					.map { (resourceType, _) -> buildTradeRoute(bundledTradeRoute, resourceType, turn) }
			}
			.sortedByDescending { it.rating }
			.take(amount)
			.toList()
	}

	private fun buildTradeRoute(bundledTradeRoute: BundledTradeRoute, type: ResourceType, turn: Int): TradeRoute {
		return TradeRoute(
			srcProvinceId = bundledTradeRoute.src.provinceId,
			dstProvinceId = bundledTradeRoute.dst.provinceId,
			routeIds = bundledTradeRoute.routes.map { it.routeId },
			resourceType = type,
			rating = bundledTradeRoute.rating[type] ?: -1f,
			creationTurn = turn,
		)
	}

	private fun getRoutesPath(a: Province, b: Province, routes: Collection<Route>): List<Route> {
		return RouteBasedPathfinder().find(a.provinceCapitalCityId, b.provinceCapitalCityId, routes)
	}


	private fun getRating(tradeRoute: BundledTradeRoute): Map<ResourceType, Float> {
		val demandsSrc = tradeRoute.src.resourceDemands
		val demandsDst = tradeRoute.dst.resourceDemands
		return ResourceType.values().associateWith { resourceType ->
			val demandSrc = demandsSrc[resourceType] ?: 0f
			val demandDst = demandsDst[resourceType] ?: 0f
			val balanceSrc = tradeRoute.src.resourcesProducedPrevTurn[resourceType] - tradeRoute.src.resourcesConsumedCurrTurn[resourceType]
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

	private fun countTradeRoutes(owner: Province): Int {
		return owner.tradeRoutes.count()
	}

}


internal class MarketNetwork {

	companion object {

		fun networksFrom(game: GameExtended): List<MarketNetwork> {
			val networks = mutableListOf<MarketNetwork>()
			game.routes.forEach { route ->
				val provinceA = getProvince(game, route.cityIdA)
				val provinceB = getProvince(game, route.cityIdB)
				val networkA = findNetwork(networks, provinceA)
				val networkB = findNetwork(networks, provinceB)
				// both cities "a" and "b" do not exist an any network
				if (networkA == null && networkB == null) {
					networks.add(MarketNetwork().also {
						it.add(provinceA, route)
						it.add(provinceB, route)
					})
				}
				// only city "a" already exists in some network
				if (networkA != null && networkB == null) {
					networkA.add(provinceB, route)
				}
				// only city "b" already exists in some network
				if (networkA == null && networkB != null) {
					networkB.add(provinceA, route)
				}
				// both cities already exist in different networks
				if (networkA != null && networkB != null && networkA != networkB) {
					val merged = MarketNetwork().also {
						it.add(networkA)
						it.add(networkB)
					}
					networks.remove(networkA)
					networks.remove(networkB)
					networks.add(merged)
				}
			}
			return networks
		}

		private fun getProvince(game: GameExtended, cityId: String): Province {
			return game.provinces.find { it.cityIds.contains(cityId) } ?: throw Exception("Could not find province by city")
		}

		private fun findNetwork(networks: Collection<MarketNetwork>, province: Province): MarketNetwork? {
			return networks.find { it.contains(province) }
		}

	}

	private val provinces = mutableSetOf<Province>()
	private val routes = mutableSetOf<Route>()

	fun add(province: Province, route: Route) {
		provinces.add(province)
		routes.add(route)
	}

	fun add(network: MarketNetwork) {
		provinces.addAll(network.provinces)
		routes.addAll(network.routes)
	}

	fun contains(province: Province) = provinces.contains(province)

	fun getProvinces(): Set<Province> = provinces

	fun getRoutes(): Set<Route> = routes

	fun getAverageResourceBalance(): ResourceStats {
		val values = ResourceType.values().associateWith { mutableListOf<Float>() }
		provinces.forEach { province ->
			MarketUtils.iterateResourceBalance(province) { type, balance ->
				values[type]!!.add(balance)
			}
		}
		return ResourceStats.from(values.mapValues { it.value.average() })
	}

}
