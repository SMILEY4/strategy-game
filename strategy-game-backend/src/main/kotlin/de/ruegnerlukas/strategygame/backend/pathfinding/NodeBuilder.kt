package de.ruegnerlukas.strategygame.backend.pathfinding

import de.ruegnerlukas.strategygame.backend.common.models.Tile

/**
 * Builds a node. Can be used to attach custom data to nodes.
 */
interface NodeBuilder<T: Node> {

    /**
     * @return the node for the given starting tile
     */
    fun start(tile: Tile): T

    /**
     * @return the node for the given tile with the given previous node and given score
     */
    fun next(prev: T, tile: Tile, score: NodeScore): T

}