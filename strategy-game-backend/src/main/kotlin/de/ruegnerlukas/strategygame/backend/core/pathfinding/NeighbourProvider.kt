package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer

interface NeighbourProvider<T: Node> {

    fun get(node: T, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit)

}