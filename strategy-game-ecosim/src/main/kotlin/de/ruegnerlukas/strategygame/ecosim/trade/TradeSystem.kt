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

    fun updateTradeRouteRating() {
        network.routes.forEach { route ->
            route.rating = getTradeRouteRating(route.from, route.to)
        }
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

    fun getValidSortedRoutes(): List<TradeRoute> {
        return network.routes
            .filter { it.rating.second }
            .sortedByDescending { it.rating.first }
    }


    fun updateTrade() {
        getValidSortedRoutes().forEach { route ->
            val availableFrom = route.from.getCurrentBalance()
            val availableTo = route.to.getCurrentBalance()
            if (availableFrom > 0 && availableFrom > availableTo) {
                route.from.sellTo(1.0, route.to.name)
                route.to.buyFrom(1.0, route.from.name)
            }
        }
    }

    fun stepTrade() {
        updateTradeNodesDemand()
        updateTradeRouteRating()
        updateTrade()
    }


    fun getTree(root: TradeNode): List<TradeRoute> {
        val visited = mutableSetOf<String>()
        val edges = mutableListOf<TradeRoute>()
        visited.add(root.name)
        while (visited.size < network.nodes.size) {
            visited
                .flatMap { node -> network.routes.filter { it.from.name == node } }
                .sortedBy { it.rating.first }
                .forEach { route ->
                    if (!visited.contains(route.to.name)) {
                        edges.add(route)
                        visited.add(route.to.name)
                    }
                }
        }
        return edges
    }


    fun generatePrimaryTradeRoutes(): List<TradeRoute> {
        // each node can only create one/n trade route
        // the node generating the route chooses if it's the "origin" or destination

        val avgAvailability = averageResourceAvailability()
        val primaryRoutes = mutableListOf<TradeRoute>()

        network.nodes
            .sortedByDescending { it.localResourceAvailability }
            .forEach { node ->
                network.nodes
                    .asSequence()
                    .filter { it != node }
                    .flatMap { listOf(TradeRoute(node, it), TradeRoute(it, node)) }
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
        println("${route.from.name}:${route.from.getCurrentBalance()} -> ${route.to.name}:${route.to.getCurrentBalance()} ==> $tradeTarget | $reqAmount")
        return min(route.from.getCurrentBalance(), reqAmount)
    }


}