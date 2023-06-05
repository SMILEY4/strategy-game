package de.ruegnerlukas.strategygame.backend.pathfinding

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.containers.TileContainer

/**
 * Provides valid neighbour tiles for a given tile
 */
interface NeighbourProvider<T: Node> {

    /**
     * @param node the current node to get the neighbours of
     * @param tiles all available tiles
     * @param consumer function consuming each neighbours
     */
    fun get(node: T, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit)

}