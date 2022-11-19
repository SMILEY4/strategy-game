package de.ruegnerlukas.strategygame.ecosim.trade

class TradeSystem(private val network: TradeNetwork) {

    fun averageResourceAvailability(): Double {
        return network.nodes.map { it.getCurrentBalance() }.average()
    }

    fun updateTradeNodeDemand() {
        val avg = averageResourceAvailability()
        network.nodes.forEach {
            val local = it.getCurrentBalance()
            it.demand = -(1.0 / (avg / local)) + 1.0
        }
    }

    fun updateTradeRouteRating() {
        network.routes.forEach { route ->
            val demandFrom = route.from.demand
            val demandTo = route.to.demand
            if (route.from.getCurrentBalance() <= 0 || demandFrom > demandTo) {
                route.rating = 0.0 to false
            } else {
                route.rating = (demandTo - demandFrom) to true
            }
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
//                val requiredSend = (availableFrom - availableTo) / 2.0
//                val send = min(requiredSend / 10.0, availableFrom)
//                route.from.tradedAmount -= send
//                route.to.tradedAmount += send

//                route.from.tradedAmount -= 1
//                route.to.tradedAmount += 1
                route.from.sellTo(1.0, route.to.name)
                route.to.buyFrom(1.0, route.from.name)
            }
        }
    }

    fun stepTrade() {
        updateTradeNodeDemand()
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
                    if(!visited.contains(route.to.name)) {
                        edges.add(route)
                        visited.add(route.to.name)
                    }
                }
        }
        return edges
    }


}