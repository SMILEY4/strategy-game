package de.ruegnerlukas.strategygame.backend.pathfinding_v2

interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}