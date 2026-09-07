package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import java.util.PriorityQueue
import kotlin.collections.isNotEmpty

class Pathfinder(private val calculateCost: (current: Tile, target: Tile) -> Float) {

    data class Path(
        val tiles: List<Tile>,
        val cost: Float
    )

    private data class QueueEntry(
        val tile: Tile,
        val cost: Float
    )

    fun find(tiles: List<Tile>, from: Tile.Ref, to: Tile.Ref): Path? {

        val tilesById = tiles.associateBy { it.id }
        val tilesByPosition = tiles.associateBy { it.position }

        val start = tilesById[from.id] ?: return null
        val target = tilesById[to.id] ?: return null

        if (start.id == target.id) {
            return Path(emptyList(), 0f)
        }

        val queue = PriorityQueue<QueueEntry>(compareBy { it.cost })
        val costs = mutableMapOf(start.id to 0f)
        val previous = mutableMapOf<Tile.Id, Tile.Id>()
        queue += QueueEntry(start, 0f)

        while (queue.isNotEmpty()) {
            val current = queue.poll()
            if (current.cost != costs[current.tile.id]) {
                continue
            }
            if (current.tile.id == target.id) {
                break
            }

            for (neighbourPosition in neighbourPositions(current.tile.position)) {
                val neighbour = tilesByPosition[neighbourPosition] ?: continue
                val stepCost = calculateCost(current.tile, neighbour)
                if (stepCost == Float.POSITIVE_INFINITY) {
                    continue
                }

                val newCost = current.cost + stepCost
                if (newCost < (costs[neighbour.id] ?: Float.POSITIVE_INFINITY)) {
                    costs[neighbour.id] = newCost
                    previous[neighbour.id] = current.tile.id
                    queue += QueueEntry(neighbour, newCost)
                }
            }
        }

        val totalCost = costs[target.id] ?: return null
        val path = mutableListOf<Tile>()
        var currentId = target.id
        path += target

        while (currentId != start.id) {
            currentId = previous[currentId] ?: return null
            path += tilesById.getValue(currentId)
        }

        return Path(path.asReversed(), totalCost)
    }

    private fun neighbourPositions(position: HexPosition): List<HexPosition> {
        return listOf(
            HexPosition(position.q + 1, position.r),
            HexPosition(position.q + 1, position.r - 1),
            HexPosition(position.q, position.r - 1),
            HexPosition(position.q - 1, position.r),
            HexPosition(position.q - 1, position.r + 1),
            HexPosition(position.q, position.r + 1),
        )
    }
}
