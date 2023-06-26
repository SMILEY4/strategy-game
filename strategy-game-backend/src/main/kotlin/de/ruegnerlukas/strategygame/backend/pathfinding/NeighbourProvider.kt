package de.ruegnerlukas.strategygame.backend.pathfinding

interface NeighbourProvider<T: Node> {
    fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit)
}