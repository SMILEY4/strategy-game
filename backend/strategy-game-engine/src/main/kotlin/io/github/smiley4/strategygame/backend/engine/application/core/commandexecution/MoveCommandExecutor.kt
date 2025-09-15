package io.github.smiley4.strategygame.backend.engine.application.core.commandexecution

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.engine.application.core.tools.Tools
import kotlin.collections.toMutableList

class MoveCommandExecutor : Logging {

    fun execute(gameState: GameState, command: Command<CommandData.Move>) {
        log().debug("Executing move command for object ${command.data.worldObject} with path length ${command.data.path.size}.")

        // skip if path is empty
        if(command.data.path.isEmpty() || command.data.path.size == 1) {
            log().debug("Path to move is empty, skipping.")
            return
        }

        // find world object to move
        val worldObject = gameState.worldObjects.find { it.id == command.data.worldObject }
            ?: throw Exception("Could not find world object ${command.data.worldObject}")


        // validate: world object must be movable
        if(!worldObject.hasComponent<WorldObjectComponent.Movement>()) {
            throw Exception("World object can not be moved.")
        }

        // validate: first tile in path must match current location
        if(worldObject.tile.id != command.data.path.first().id) {
            throw Exception("World object not located at start of path (obj at ${worldObject.tile} vs start at ${command.data.path.first()}")
        }

        // walk path (as far as possible)
        walkPath(command.data.path, gameState, worldObject) { next ->
            worldObject.tile = next
            Tools.discoverArea(gameState, worldObject)
        }

    }

    private fun walkPath(path: List<Tile.Ref>, gameState: GameState, worldObject: WorldObject, action: (next: Tile.Ref) -> Unit) {
        val openPath = path.toMutableList()
        var currentPathEntry = openPath.removeFirst()
        var currentCost = 0

        while (openPath.isNotEmpty()) {
            val nextPathEntry = openPath.removeFirst()

            val target = Tools
                .getValidMovementTargets(gameState, worldObject, currentPathEntry, currentCost, false)
                .find { it.tile == nextPathEntry }

            if (target == null) {
                break
            }

            action(nextPathEntry)

            currentCost += target.cost
            currentPathEntry = nextPathEntry
        }
    }

}