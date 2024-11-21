package io.github.smiley4.strategygame.backend.pathfinding.neighbours

import io.github.smiley4.strategygame.backend.pathfinding.Node

interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}