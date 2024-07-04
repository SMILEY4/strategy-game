package io.github.smiley4.strategygame.backend.pathfinding.module

import io.github.smiley4.strategygame.backend.pathfinding.edge.Node

internal interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}