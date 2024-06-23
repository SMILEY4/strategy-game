package io.github.smiley4.strategygame.backend.pathfinding.module.algorithms.astar

import io.github.smiley4.strategygame.backend.pathfinding.module.NeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.module.Node
import io.github.smiley4.strategygame.backend.pathfinding.module.NodeScore
import io.github.smiley4.strategygame.backend.pathfinding.module.Path
import io.github.smiley4.strategygame.backend.pathfinding.module.Pathfinder
import io.github.smiley4.strategygame.backend.pathfinding.module.ScoreCalculator

internal class AStarPathfinder<T : Node>(
    private val neighbourProvider: NeighbourProvider<T>,
    private val scoreCalculator: ScoreCalculator<T>
) : Pathfinder<T> {

    override fun find(start: T, end: T): Path<T> {
        if (start == end || start.locationId == end.locationId) {
            return Path(listOf(start))
        }
        val context = PathfindingContext<T>(OpenList(), VisitedList())
        context.pushOpen(start)
        return iterateOpen(context, end) { currentNode ->
            neighbourProvider.getNeighbours(currentNode) { neighbourNode ->
                val score = calculateScore(currentNode, neighbourNode, end)
                visitTile(context, neighbourNode, score)
            }
        }
    }

    private fun iterateOpen(ctx: PathfindingContext<T>, destination: T, consumer: (node: T) -> Unit): Path<T> {
        while (ctx.hasOpen()) {
            val currentNode = ctx.getNextOpen().next()
            if (currentNode == destination || currentNode.locationId == destination.locationId) {
                return reconstructPath(currentNode)
            } else {
                consumer(currentNode)
            }
        }
        return Path.empty()
    }

    private fun calculateScore(prev: T, next: T, destination: T): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }

    private fun visitTile(ctx: PathfindingContext<T>, current: T, score: NodeScore) {
        val prevScore = ctx.getVisitedGScore(current)
        if (prevScore == null || score.g < prevScore) {
            current.also {
                it.f = score.f
                it.g = score.g
                it.h = score.h
                ctx.pushOpen(it)
            }
        }
    }

    private fun reconstructPath(node: T): Path<T> {
        val nodes = mutableListOf<T>()
        var current: T? = node
        while (current != null) {
            nodes.add(current)
            @Suppress("UNCHECKED_CAST")
            current = current.prevNode?.let { it as T }
        }
        return Path(nodes.reversed())
    }

}