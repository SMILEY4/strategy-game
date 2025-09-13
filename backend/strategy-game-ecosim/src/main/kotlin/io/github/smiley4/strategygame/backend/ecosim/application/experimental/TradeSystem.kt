package io.github.smiley4.strategygame.backend.ecosim.application.experimental

import kotlin.math.min

object TradeSystem {

    fun generateTrades(graph: Graph): MutableList<Trade> {

        // find all possible routes
        val producers = graph.nodes.filter { it.storage.produces > 0 }
        val consumers = graph.nodes.filter { it.storage.consumes > 0 }

        val possibleRoutes = buildList {
            producers.forEach { producer ->
                consumers.forEach { consumer ->
                    val (path, distance) = Pathfinding.dijkstra(graph, producer, consumer)
                    if (path.isNotEmpty()) {
                        this.add(
                            Route(
                                producer = producer,
                                consumer = consumer,
                                path = path,
                                distance = distance
                            )
                        )
                    }
                }
            }
        }.sortedBy { it.distance }

        // find possible efficient trades
        val trades = mutableListOf<Trade>()

        val remainingProduced = producers.associateWith { it.storage.produces }.toMutableMap()
        val remainingRequired = consumers.associateWith { it.storage.consumes }.toMutableMap()

        possibleRoutes.forEach { route ->

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
        val producer: Node,
        val consumer: Node,
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