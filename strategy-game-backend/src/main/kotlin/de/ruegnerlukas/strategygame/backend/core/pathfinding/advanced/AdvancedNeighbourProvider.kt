package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.NextNodeRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours

class AdvancedNeighbourProvider : NeighbourProvider<AdvancedNode> {

    private val rules = mutableListOf<NextNodeRule>()

    fun withRules(rules: Collection<NextNodeRule>): AdvancedNeighbourProvider {
        this.rules.clear()
        this.rules.addAll(rules)
        return this
    }

    override fun get(node: AdvancedNode, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit) {
        positionsNeighbours(node.tile.position) { q, r ->
            val neighbour = tiles.get(q, r)
            if (neighbour != null && allRulesApply(node, neighbour)) {
                consumer(neighbour)
            }
        }
    }

    private fun allRulesApply(prev: AdvancedNode, next: Tile): Boolean {
        return rules.all { it.evaluate(prev, next) }
    }


}