package io.github.smiley4.strategygame.backend.ecosim.application.experimental

import io.github.smiley4.strategygame.backend.common.utils.containedIn
import kotlin.math.min

/**
 * pathfind from each node to each other node in complete graph (cacheable)
 * populate nodes with resources produced and resources required
 * for each resource type
 *    find all producers and consumers
 *    find all relevant routes (starting/ending with a consumer and producer)
 *    sort relevant routes by distance (shortest to longest)
 *    for each route
 *        if producer and consumer no longer valid producer and consumer (i.e. depleted or satisfied)
 *            continue
 *        get amount of resource to be traded, i.e min of remaining produced and remaining required
 *        remove amount traded from producer / remaining produced
 *        remove amount traded from consumer / remaining required
 *        add trade to list of performed trades
 *
 *  Idea for adding warehouses:
 *  warehouse
 *  - has amount of currently stored resource(s)
 *  - has max amount possible to be added or removed each turn (cannot fill/deplete all at once) ?
 *  as second step after normal trades collection (some nodes may still have resources to offer and some still require resources)
 *  populate nodes with additional resources produced (from warehouses) and resources required (for filling warehouses)
 *  perform step 1 again (restriction, cannot trade from warehouse to warehouse)
 */
object TradeSystem {

    fun generateTrades(graph: Graph): MutableList<Trade> {

        // find all possible routes
        val producers = graph.nodes.filter { it.storage.produces > 0 }
        val consumers = graph.nodes.filter { it.storage.consumes > 0 }

        val relevantRoutes = Pathfinding
            .allToAll(graph)
            .filter {
                (it.first.first().containedIn(producers) || it.first.first().containedIn(consumers))
                        && it.first.last().containedIn(producers) || it.first.last().containedIn(consumers)
            }
            .flatMap {
                val nodeFirst = it.first.first()
                val nodeLast = it.first.last()
                val routes = mutableListOf<Route>()
                if(nodeFirst.containedIn(producers)) {
                    routes.add(
                        Route(
                            producer = nodeFirst,
                            consumer = nodeLast,
                            path = it.first,
                            distance = it.second
                        )
                    )
                }
                if(nodeLast.containedIn(producers)) {
                    routes.add(
                        Route(
                            producer = nodeLast,
                            consumer = nodeFirst,
                            path = it.first.asReversed(),
                            distance = it.second
                        )
                    )
                }
                routes
            }
            .sortedBy { it.distance }

        // find possible efficient trades
        val trades = mutableListOf<Trade>()

        val remainingProduced = producers.associateWith { it.storage.produces }.toMutableMap()
        val remainingRequired = consumers.associateWith { it.storage.consumes }.toMutableMap()

        relevantRoutes.forEach { route ->

            if (!remainingProduced.containsKey(route.producer) || !remainingRequired.containsKey(route.consumer)) {
                return@forEach
            }

            val amountProduced = remainingProduced[route.producer]!!
            val amountRequired = remainingRequired[route.consumer]!!
            val traded = min(amountProduced, amountRequired)

            trades.add(
                Trade(
                    producer = route.producer,
                    consumer = route.consumer,
                    path = route.path,
                    amount = traded,
                )
            )

            remainingProduced[route.producer] = remainingProduced[route.producer]!! - traded
            if (remainingProduced[route.producer]!! < 0.001) {
                remainingProduced.remove(route.producer)
            }

            remainingRequired[route.consumer] = remainingRequired[route.consumer]!! - traded
            if (remainingRequired[route.consumer]!! < 0.001) {
                remainingRequired.remove(route.consumer)
            }
        }

        return trades
    }

    data class Route(
        val producer: Node, // from
        val consumer: Node, // to
        val path: List<Node>,
        val distance: Float
    )

    data class Trade(
        val producer: Node,
        val consumer: Node,
        val path: List<Node>,
        val amount: Float,
    )

}