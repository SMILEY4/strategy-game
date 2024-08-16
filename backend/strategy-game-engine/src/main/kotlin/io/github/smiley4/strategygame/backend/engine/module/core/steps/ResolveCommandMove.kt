package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.edge.MovementService

internal class ResolveCommandMove(private val movementService: MovementService) : Logging {

    fun resolve(game: GameExtended, command: Command<MoveCommandData>) {
        log().debug("Resolving move command for object ${command.data.worldObjectId} with path size ${command.data.path.size}")

        val worldObject = game.worldObjects.find { it.id == command.data.worldObjectId }
            ?: throw Exception("Could not find world object ${command.data.worldObjectId}")

        // skip empty paths
        if (command.data.path.isEmpty() || command.data.path.size == 1) {
            return
        }

        // first tile in patch must match current location of object
        if (worldObject.tile.id != command.data.path.first().id) {
            throw Exception("World object not located at start of path ${worldObject.tile} vs ${command.data.path.first()}")
        }

        // step along path (as far as possible)
        walkPath(command.data.path, game, worldObject) { next ->
            worldObject.tile = next
            positionsCircle(next, worldObject.viewDistance).forEach { pos ->
                game.findTileOrNull(pos)?.dataPolitical?.discoveredByCountries?.add(worldObject.country)
            }
        }
    }

    private fun walkPath(path: List<TileRef>, game: GameExtended, worldObject: WorldObject, action: (next: TileRef) -> Unit) {
        val openPath = path.toMutableList()
        var currentPathEntry = openPath.removeFirst()
        var currentCost = 0

        while (openPath.isNotEmpty()) {
            val nextPathEntry = openPath.removeFirst()

            val target = findMovementTarget(currentPathEntry, nextPathEntry, currentCost, game, worldObject)
            if (target == null) {
                break
            }

            action(nextPathEntry)

            currentCost += target.cost
            currentPathEntry = nextPathEntry
        }
    }

    private fun findMovementTarget(
        current: TileRef,
        destination: TileRef,
        currentCost: Int,
        game: GameExtended,
        worldObject: WorldObject
    ): MovementTarget? {
        val availableTargets = movementService.getAvailablePositions(game, worldObject, current, currentCost)
        return availableTargets.find { it.tile == destination && currentCost + it.cost <= worldObject.maxMovement }
    }

}