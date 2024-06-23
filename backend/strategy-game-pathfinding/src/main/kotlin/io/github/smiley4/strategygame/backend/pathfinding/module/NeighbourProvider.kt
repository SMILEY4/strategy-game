package io.github.smiley4.strategygame.backend.pathfinding.module

internal interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}