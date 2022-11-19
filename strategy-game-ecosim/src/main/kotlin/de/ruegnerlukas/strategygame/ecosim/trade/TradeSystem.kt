package de.ruegnerlukas.strategygame.ecosim.trade

import kotlin.math.min

class TradeSystem(private val network: TradeNetwork) {

    fun averageResourceAvailability(): Double {
        return network.nodes.map { it.getCurrentBalance() }.average()
    }

    fun updateTradeNodesDemand() {
        val avg = averageResourceAvailability()
        network.nodes.forEach {
            updateTradeNodeDemand(it, avg)
        }
    }

    fun updateTradeNodeDemand(node: TradeNode, avg: Double) {
        val local = node.getCurrentBalance()
        node.demand = -(1.0 / (avg / local)) + 1.0
    }

    fun getTradeRouteRating(origin: TradeNode, destination: TradeNode): Pair<Double, Boolean> {
        val demandOrigin = origin.demand
        val demandDestination = destination.demand
        if (origin.getCurrentBalance() <= 0 || demandOrigin > demandDestination) {
            return 0.0 to false
        } else {
            return (demandDestination - demandOrigin) to true
        }
    }

    fun generatePrimaryTradeRoutes(): List<TradeRoute> {
        /*
        each node can only create one/n trade route
        the node generating the route chooses if it's the "origin" or destination

        sort nodes by who has the most to sell, for each node
            get list of valid target nodes (connected + in range)
            create list of possible trade routes from targets (2x routes per target - one for each direction)
            rate each route based on supply/demand of origin and target
            create route with best rating
         */

        val maxTradeDist = 4

        val avgAvailability = averageResourceAvailability()
        val primaryRoutes = mutableListOf<TradeRoute>()

        network.nodes
            .sortedByDescending { it.localResourceAvailability }
            .forEach { node ->
                network.nodes
                    .asSequence()
                    .filter { it != node }
                    .flatMap { listOf(TradeRoute(node, it), TradeRoute(it, node)) }
                    .onEach { it.length = calcPath(it.from, it.to).size }
                    .filter { it.length <= maxTradeDist }
                    .onEach { it.rating = getTradeRouteRating(it.from, it.to) }
                    .filter { it.rating.second }
                    .sortedByDescending { it.rating.first }
                    .firstOrNull()
                    ?.let { route ->
                        primaryRoutes.add(route)
                        val tradeAmount = calcTradeAmount(route)
                        route.tradeAmount = tradeAmount
                        route.from.sellTo(tradeAmount, route.to.name)
                        route.to.buyFrom(tradeAmount, route.from.name)
                        updateTradeNodeDemand(route.from, avgAvailability)
                        updateTradeNodeDemand(route.to, avgAvailability)
                    }
            }

        return primaryRoutes
    }


    fun calcTradeAmount(route: TradeRoute): Double {
        val tradeTarget = ((route.from.getCurrentBalance() + route.to.getCurrentBalance()) / 2f)
        val reqAmount = -(route.to.getCurrentBalance() - tradeTarget)
        return min(route.from.getCurrentBalance(), reqAmount)
    }


    fun calcPath(source: TradeNode, target: TradeNode): List<TradeNode> {
        val q = mutableListOf<TradeNode>()
        val dist = mutableMapOf<TradeNode, Double>()
        val prev = mutableMapOf<TradeNode, TradeNode?>()
        network.nodes.forEach { v ->
            dist[v] = Double.POSITIVE_INFINITY
            prev[v] = null
            q.add(v)
        }
        dist[source] = 0.0
        while (q.isNotEmpty()) {
            val u = q.sortedBy { dist[it] }.first()
            if (u == target) {
                val s = mutableListOf<TradeNode>()
                if (prev[u] != null || u == source) {
                    var u0: TradeNode? = u
                    while (u0 != null) {
                        s.add(0, u0)
                        u0 = prev[u0]
                    }
                    return s
                }
            } else {
                q.remove(u)
                network.routes.filter { it.from == u }.filter { q.contains(it.to) }.map { it.to }.toSet().forEach { v ->
                    val alt = dist[u]!! + 1.0
                    if (alt < dist[v]!!) {
                        dist[v] = alt
                        prev[v] = u
                    }
                }
            }
        }
        return emptyList()
    }


}