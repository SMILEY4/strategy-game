package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route

class MarketNetwork {

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
