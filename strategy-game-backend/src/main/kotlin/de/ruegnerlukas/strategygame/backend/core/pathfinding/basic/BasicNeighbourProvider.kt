package de.ruegnerlukas.strategygame.backend.core.pathfinding.basic

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours

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