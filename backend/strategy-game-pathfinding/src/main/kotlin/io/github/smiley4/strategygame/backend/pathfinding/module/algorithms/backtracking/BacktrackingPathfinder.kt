package io.github.smiley4.strategygame.backend.pathfinding.module.algorithms.backtracking

import io.github.smiley4.strategygame.backend.pathfinding.edge.NeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.edge.Node
import io.github.smiley4.strategygame.backend.pathfinding.module.NodeScore
import io.github.smiley4.strategygame.backend.pathfinding.edge.Path
import io.github.smiley4.strategygame.backend.pathfinding.edge.Pathfinder
import io.github.smiley4.strategygame.backend.pathfinding.edge.ScoreCalculator
import java.util.PriorityQueue

private typealias OpenPathQueue<T> = PriorityQueue<BacktrackingPath<T>>

internal class BacktrackingPathfinder<T : Node>(
    private val neighbourProvider: NeighbourProvider<T>,
    private val scoreCalculator: ScoreCalculator<T>
) : Pathfinder<T> {

    override fun find(start: T, end: T): Path<T> {
        if (start == end || start.locationId == end.locationId) {
            return Path(listOf(start))
        }
        val openPaths = initOpenPaths(start)
        return iterateOpen(openPaths, end) { currentPath ->
            findPossibleNextNodes(currentPath) { neighbourNode ->
                openPaths.add(append(currentPath, neighbourNode, end))
            }
        }.asPath()
    }


    private fun initOpenPaths(start: T): OpenPathQueue<T> {
        return PriorityQueue<BacktrackingPath<T>>(Comparator.comparing { it.f }).also {
            it.offer(BacktrackingPath.of(start))
        }
    }

    private fun iterateOpen(openPaths: OpenPathQueue<T>, destination: T, consumer: (path: BacktrackingPath<T>) -> Unit): BacktrackingPath<T> {
        while (openPaths.isNotEmpty()) {
            val current = openPaths.poll()
            if(current.nodes.last() == destination || current.nodes.last().locationId == destination.locationId) {
                return current
            }
            consumer(current)
        }
        return BacktrackingPath.of()
    }

    private fun findPossibleNextNodes(path: BacktrackingPath<T>, consumer: (next: T) -> Unit) {
        neighbourProvider.getNeighbours(path.nodes.last()) { neighbour ->
            if (!path.nodeIds.contains(neighbour.locationId)) {
                consumer(neighbour)
            }
        }
    }

    private fun append(path: BacktrackingPath<T>, next: T, destination: T): BacktrackingPath<T> {
        val score = calculateScore(path.nodes.last(), next, destination)
        next.also {
            it.f = score.f
            it.g = score.g
            it.h = score.h
        }
        return BacktrackingPath.of(path, next)
    }

    private fun calculateScore(prev: T, next: T, destination: T): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }

}