package io.github.smiley4.strategygame.backend.engine.application.core.tools

import io.github.smiley4.strategygame.backend.common.utils.buildMutableList
import io.github.smiley4.strategygame.backend.common.utils.buildMutableSet
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Settlement

class SettlementNetworkBuilder {

    fun build(settlements: Collection<Settlement.Id>, routes: Collection<Route>): List<Set<Settlement.Id>> {

        val networks = buildMutableList {
            // initialize a network for each settlement
            settlements.forEach {
                add(mutableSetOf(it))
            }
        }

        routes.forEach { route ->
            val connectedNetworks = networks.filter { it.contains(route.settlementA) || it.contains(route.settlementB) }
            when {
                // no network containing any settlement of route exists -> found completely new network
                connectedNetworks.isEmpty() -> {
                    networks.add(mutableSetOf(route.settlementA, route.settlementB))
                }
                // one network containing a settlement of route exists -> route is part of this network
                connectedNetworks.size == 1 -> {
                    connectedNetworks.first().add(route.settlementA)
                    connectedNetworks.first().add(route.settlementB)
                }
                // multiple networks containing settlements of route exist -> route connects two networks -> merge into one network
                else -> {
                    networks.removeAll(connectedNetworks)
                    networks.add(buildMutableSet {
                        addAll(connectedNetworks.flatten())
                    })
                }
            }
        }

        return networks
    }

}