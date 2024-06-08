package io.github.smiley4.strategygame.backend.pathfinding

interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}