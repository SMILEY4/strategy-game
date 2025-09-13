package io.github.smiley4.strategygame.backend.ecosim.application.experimental

object Pathfinding {

    fun allToAll(graph: Graph): List<Pair<List<Node>, Float>> {

        val paths = mutableMapOf<Pair<Node, Node>, Pair<List<Node>, Float>>()

        graph.nodes.forEach { source ->

            val distance = mutableMapOf<Node, Float>()
            val previous = mutableMapOf<Node, Node?>()
            val open = mutableListOf<Node>()

            // prepare graph
            graph.nodes.forEach { node ->
                distance[node] = Float.POSITIVE_INFINITY
                previous[node] = null
                open.add(node)
            }
            distance[source] = 0f

            while(open.isNotEmpty()) {

                // find current best candidate
                val current = open
                    .minBy { distance[it]!! }
                    .also { open.remove(it) }
                val currentDistance = distance[current]!!

                // update neighbours
                graph.edges.filter { it.a == current || it.b == current }.forEach { edge ->
                    val neighbour = if(edge.a == current) edge.b else edge.a
                    if(open.contains(neighbour)) {
                        if(currentDistance + edge.cost < distance[neighbour]!!) {
                            distance[neighbour] = currentDistance + edge.cost
                            previous[neighbour] = current
                        }
                    }
                }

            }

            graph.nodes.forEach { target ->

                if(paths.containsKey(source to target) || paths.containsKey(target to source)) {
                    return@forEach
                }

                // reconstruct path
                val path = mutableListOf<Node>()
                var cursor: Node? = target
                while(cursor != null) {
                    path.add(0, cursor)
                    cursor = previous[cursor]
                }
                paths[source to target] = path to distance[target]!!

            }

        }

        return paths.map { it.value }
    }


    fun pointToPoint(graph: Graph, source: Node, target: Node): Pair<List<Node>, Float> {

        val distance = mutableMapOf<Node, Float>()
        val previous = mutableMapOf<Node, Node?>()
        val open = mutableListOf<Node>()

        // prepare graph
        graph.nodes.forEach { node ->
            distance[node] = Float.POSITIVE_INFINITY
            previous[node] = null
            open.add(node)
        }
        distance[source] = 0f

        // search until path is found
        while(open.isNotEmpty()) {

            // find current best candidate
            val current = open
                .minBy { distance[it]!! }
                .also { open.remove(it) }
            val currentDistance = distance[current]!!

            // current candidate is target => done
            if(current == target) {
                break
            }

            // search neighbours of current node
            graph.edges.filter { it.a == current || it.b == current }.forEach { edge ->
                val neighbour = if(edge.a == current) edge.b else edge.a
                if(open.contains(neighbour)) {
                    if(currentDistance + edge.cost < distance[neighbour]!!) {
                        distance[neighbour] = currentDistance + edge.cost
                        previous[neighbour] = current
                    }
                }
            }

        }

        // reconstruct path
        val path = mutableListOf<Node>()
        var cursor: Node? = target
        while(cursor != null) {
            path.add(0, cursor)
            cursor = previous[cursor]
        }


        return path.toList() to distance[target]!!
    }

}