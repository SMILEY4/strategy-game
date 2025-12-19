package io.github.smiley4.strategygame.backend.engine.application.core.actions

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.positionsNeighbours
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.pathfinding.Node
import io.github.smiley4.strategygame.backend.pathfinding.Pathfinder
import io.github.smiley4.strategygame.backend.pathfinding.neighbours.NeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.score.ScoreCalculator
import kotlin.math.min

const val MAX_PATH_LENGTH = 30

class ConstructRouteAction {

    fun onWorldUpdate(gameState: GameState) {

        val pathfinder = Pathfinder.createAStar(TerrainBasedNeighbourProvider(gameState.tiles), BasicScoreCalculator())

        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.RouteNote>() }
            .forEach { from ->

                gameState.worldObjects
                    .filter { it.hasComponent<WorldObjectComponent.RouteNote>() }
                    .forEach { to ->

                        constructRoute(from, to, gameState, pathfinder)?.also {
                            gameState.routes.add(it)
                        }

                    }
            }
    }

    private fun constructRoute(from: WorldObject, to: WorldObject, gameState: GameState, pathfinder: Pathfinder<PathfinderNode>): Route? {
        // source and destination are the same
        if (from == to) {
            return null
        }
        // both world objects are too far apart -> early out
        val maxConnectionDistance = min(
            from.getComponent<WorldObjectComponent.RouteNote>().maxRouteConnectionDistance,
            to.getComponent<WorldObjectComponent.RouteNote>().maxRouteConnectionDistance
        )
        if (from.tile.position.distance(to.tile.position) > maxConnectionDistance) {
            return null
        }
        // there is already a route between the two world objects -> early out
        if (gameState.routes.any { (it.worldObjectA == from.id && it.worldObjectB == to.id) || (it.worldObjectA == to.id && it.worldObjectB == from.id) }) {
            return null
        }
        // both world objects are located on the same tile
        if (from.tile.id == to.tile.id) {
            return Route(
                id = Route.Id.gen(),
                worldObjectA = from.id,
                worldObjectB = to.id,
                path = listOf(from.tile, to.tile),
                cost = 0f
            )
        }

        // calculate path
        val path = pathfinder.find(
            PathfinderNode(
                tile = gameState.tiles.get(from.tile)!!,
                pathLength = 0,
                prevNode = null
            ),
            PathfinderNode(
                tile = gameState.tiles.get(to.tile)!!,
                pathLength = 0,
                prevNode = null
            )
        )

        // path is too short
        if (path.nodes.size < 2) {
            return null
        }
        // path is too long
        if (path.nodes.size > MAX_PATH_LENGTH) {
            return null
        }

        // create route
        return Route(
            id = Route.Id.gen(),
            worldObjectA = from.id,
            worldObjectB = to.id,
            path = path.nodes.map { it.tile.ref() },
            cost = path.nodes.size - 2f
        )
    }

}


class PathfinderNode(
    val tile: Tile,
    val pathLength: Int,
    prevNode: Node?,
) : Node(
    locationId = "${tile.position.q},${tile.position.r}",
    prevNode = prevNode,
    f = 0f,
    g = 0f,
    h = 0f
)

class TerrainBasedNeighbourProvider(private val tiles: Tile.Container) : NeighbourProvider<PathfinderNode> {

    override fun getNeighbours(current: PathfinderNode, consumer: (neighbour: PathfinderNode) -> Unit) {
        positionsNeighbours(current.tile.position) { q, r ->
            val neighbour = tiles.get(q, r)
            if (neighbour != null && neighbour.dataWorld.terrainType != TerrainType.WATER) {
                consumer(
                    PathfinderNode(
                        tile = neighbour,
                        pathLength = current.pathLength + 1,
                        prevNode = current
                    )
                )
            }
        }
    }

}

class BasicScoreCalculator : ScoreCalculator<PathfinderNode> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun h(node: PathfinderNode, destination: PathfinderNode): Float {
        return node.tile.position.distance(destination.tile.position).toFloat()
    }

    override fun g(prev: PathfinderNode, next: PathfinderNode): Float {
        return prev.g + 1f
    }
}