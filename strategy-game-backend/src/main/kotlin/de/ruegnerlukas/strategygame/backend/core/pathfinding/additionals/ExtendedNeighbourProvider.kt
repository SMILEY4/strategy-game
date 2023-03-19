package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.NextNodeRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours

class ExtendedNeighbourProvider : NeighbourProvider<ExtendedNode> {

    private val rules = mutableListOf<NextNodeRule>()

    fun withRules(rules: Collection<NextNodeRule>): ExtendedNeighbourProvider {
        this.rules.clear()
        this.rules.addAll(rules)
        return this
    }

    override fun get(node: ExtendedNode, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit) {
        positionsNeighbours(node.tile.position) { q, r ->
            val neighbour = tiles.get(q, r)
            if (neighbour != null && allRulesApply(node, neighbour)) {
                consumer(neighbour)
            }
        }
    }

    private fun allRulesApply(prev: ExtendedNode, next: Tile): Boolean {
        return rules.all { it.evaluate(prev, next) }
    }


}