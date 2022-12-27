package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours

class Pathfinder {

    fun find(from: TilePosition, to: TilePosition, tiles: TileContainer): Path {
        val startTile = tiles.get(from)
        val endTile = tiles.get(to)
        if (startTile == null || endTile == null) {
            return Path.EMPTY
        }
        return find(
            PathfindingContext(
                tiles = tiles,
                tileStart = startTile,
                tileEnd = endTile,
                open = OpenList(),
                visited = VisitedList()
            )
        )
    }


    fun find(ctx: PathfindingContext): Path {

        PathNode(ctx.tileStart, 0f, 0f, 0f).also {
            ctx.open.add(it)
            ctx.visited.add(it)
        }

        return iterateOpen(ctx) { currentNode ->

            iterateNeighbours(ctx, currentNode) { neighbourTile ->

                val g = g(currentNode, neighbourTile)
                val h = h(neighbourTile, ctx)
                val f = f(g, h)

                val existing = ctx.visited.get(neighbourTile)
                if (existing == null || g < existing.g) {
                    existing?.also {
                        ctx.open.remove(it)
                        ctx.visited.remove(it)
                    }
                    PathNode(neighbourTile, f, g, h, currentNode).also {
                        ctx.open.add(it)
                        ctx.visited.add(it)
                    }
                }
                
            }
        }
    }


    private fun iterateOpen(ctx: PathfindingContext, consumer: (node: PathNode) -> Unit): Path {
        while (ctx.open.isNotEmpty()) {
            val currentNode = ctx.open.next()
            if (currentNode.tile.tileId == ctx.tileEnd.tileId) {
                return reconstructPath(currentNode)
            } else {
                consumer(currentNode)
            }
        }
        return Path.EMPTY
    }


    private fun iterateNeighbours(ctx: PathfindingContext, node: PathNode, consumer: (tile: Tile) -> Unit) {
        positionsNeighbours(node.tile.position) { q, r ->
            val tile = ctx.tiles.get(q, r)
            if (tile != null) {
                consumer(tile)
            }
        }
    }


    private fun g(from: PathNode, to: Tile): Float {
        return from.g + 1f
    }


    private fun h(from: Tile, ctx: PathfindingContext): Float {
        return from.position.distance(ctx.tileEnd.position).toFloat()
    }


    private fun f(g: Float, h: Float): Float {
        return g + h
    }


    private fun reconstructPath(node: PathNode): Path {
        val nodes = mutableListOf<PathNode>()
        var current: PathNode? = node
        while (current != null) {
            nodes.add(current)
            current = current.prevNode
        }
        return Path(nodes.map { it.tile })
    }


}








