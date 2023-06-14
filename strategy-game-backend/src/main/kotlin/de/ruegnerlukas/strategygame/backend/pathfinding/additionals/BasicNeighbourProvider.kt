package de.ruegnerlukas.strategygame.backend.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileContainer
import de.ruegnerlukas.strategygame.backend.pathfinding.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.common.utils.positionsNeighbours

class BasicNeighbourProvider: NeighbourProvider<Node> {

    override fun get(node: Node, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit) {
        positionsNeighbours(node.tile.position) { q, r ->
            val neighbour = tiles.get(q, r)
            if (neighbour != null) {
                consumer(neighbour)
            }
        }
    }

}