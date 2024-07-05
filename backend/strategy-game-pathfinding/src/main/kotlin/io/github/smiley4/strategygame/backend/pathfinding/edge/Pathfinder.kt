package io.github.smiley4.strategygame.backend.pathfinding.edge

import io.github.smiley4.strategygame.backend.pathfinding.module.algorithms.astar.AStarPathfinder
import io.github.smiley4.strategygame.backend.pathfinding.module.algorithms.backtracking.BacktrackingPathfinder

/**
 * Finds the path from a given starting node to a destination node
 */
interface Pathfinder<T : Node> {
    fun find(start: T, end: T): Path<T>


    companion object {

        fun <T: Node> createBacktracking(neighbourProvider: NeighbourProvider<T>, scoreCalculator: ScoreCalculator<T>): Pathfinder<T>{
            return BacktrackingPathfinder(neighbourProvider, scoreCalculator)
        }

        fun <T: Node> createAStar(neighbourProvider: NeighbourProvider<T>, scoreCalculator: ScoreCalculator<T>): Pathfinder<T>{
            return AStarPathfinder(neighbourProvider, scoreCalculator)
        }

    }
}