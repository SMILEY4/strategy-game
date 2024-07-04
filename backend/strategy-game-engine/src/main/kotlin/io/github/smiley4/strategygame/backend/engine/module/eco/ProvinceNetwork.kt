package io.github.smiley4.strategygame.backend.engine.module.core.eco

import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.github.smiley4.strategygame.backend.engine.ports.models.Route


class ProvinceNetwork {

    companion object {

        fun networksFrom(game: GameExtended): List<ProvinceNetwork> {
            val networks = mutableListOf<ProvinceNetwork>()
            game.routes.forEach { route ->
                val provinceA = game.findProvinceByCity(route.cityIdA)
                val provinceB = game.findProvinceByCity(route.cityIdB)
                val networkA = findNetwork(networks, provinceA)
                val networkB = findNetwork(networks, provinceB)
                // both cities "a" and "b" do not exist an any network
                if (networkA == null && networkB == null) {
                    networks.add(ProvinceNetwork().also {
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
                    val merged = ProvinceNetwork().also {
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

        private fun findNetwork(networks: Collection<ProvinceNetwork>, province: Province): ProvinceNetwork? {
            return networks.find { it.contains(province) }
        }

    }

    private val provinces = mutableSetOf<Province>()
    private val routes = mutableSetOf<Route>()

    fun add(province: Province, route: Route) {
        provinces.add(province)
        routes.add(route)
    }

    fun add(network: ProvinceNetwork) {
        provinces.addAll(network.provinces)
        routes.addAll(network.routes)
    }

    fun contains(province: Province) = provinces.contains(province)

    fun getProvinces(): Set<Province> = provinces

}
