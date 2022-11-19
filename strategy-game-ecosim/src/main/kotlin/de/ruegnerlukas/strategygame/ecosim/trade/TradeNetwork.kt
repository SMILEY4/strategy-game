package de.ruegnerlukas.strategygame.ecosim.trade

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

data class TradeNetwork(
    val nodes: List<TradeNode>,
    val routes: List<TradeRoute>
) {

    fun asDotGraph(): String {
        val entriesNodes = dotNodes(nodes)
        val entriesEdges = dotEdges(routes, true)
        return "digraph G {\n" +
                entriesNodes.joinToString("\n") + "\n" +
                entriesEdges.joinToString("\n") +
                "\n}"
    }

    fun dotNodes(nodes: List<TradeNode>): MutableList<String> {
        val entriesNodes = mutableListOf<String>()
        val min = getMinMax(nodes).first
        val max = getMinMax(nodes).second
        nodes.forEach { node ->
            val a = (node.demand + abs(min)) / (max + abs(min))
            entriesNodes.add("${node.name}[style=filled,color=\"${getColor(a)}\"];")
        }
        return entriesNodes
    }

    fun dotEdges(routes: List<TradeRoute>, unidir: Boolean): MutableList<String> {
        val entriesEdges = mutableListOf<String>()
        val visitedEdges = mutableListOf<Pair<TradeNode, TradeNode>>()
        routes.forEach { route ->
            if (!visitedEdges.contains(route.from to route.to) && !visitedEdges.contains(route.to to route.from)) {
                if (unidir) {
                    entriesEdges.add("${route.from.name} -> ${route.to.name}[label=\"${route.length}\"=dir=both];")
                    visitedEdges.add(route.from to route.to)
                } else {
                    entriesEdges.add("${route.from.name} -> ${route.to.name}[label=\"${route.length}\"];")
                }
            }
        }
        return entriesEdges;
    }

    private fun getColor(a: Double): String {
        val red: Int = max(0, min((a * 255.0).toInt(), 255))
        val green: Int = max(0, min(((1.0 - a) * 255.0).toInt(), 255))
        val blue = 0
        return "#" +
                red.toString(16).padEnd(2, '0') +
                green.toString(16).padEnd(2, '0') +
                blue.toString(16).padEnd(2, '0')
    }

    private fun getMinMax(nodes: List<TradeNode>): Pair<Double, Double> {
        var min = Double.MAX_VALUE
        var max = Double.MIN_VALUE
        nodes.forEach {
            min = min(min, it.demand)
            max = max(max, it.demand)
        }
        return min to max
    }

}