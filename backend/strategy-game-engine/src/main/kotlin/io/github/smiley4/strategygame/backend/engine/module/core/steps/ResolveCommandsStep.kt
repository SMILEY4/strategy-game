package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.engine.edge.MovementService
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ResolveCommandsEvent

class ResolveCommandsStep(private val movementService: MovementService) : GameEventNode<ResolveCommandsEvent>, Logging {

    override fun handle(event: ResolveCommandsEvent, publisher: GameEventPublisher) {
        log().info("Resolving ${event.commands.size} commands for game ${event.game.meta.gameId}")
        event.commands.forEach {
            try {
                @Suppress("UNCHECKED_CAST")
                when (it.data) {
                    is MoveCommandData -> handle(event.game, it as Command<MoveCommandData>)
                }
            } catch (e: Exception) {
                log().warn("Failed to resolve command '$it' - skipping command.", e)
            }
        }
    }

    private fun handle(game: GameExtended, command: Command<MoveCommandData>) {
        log().debug("Resolving move command for object ${command.data.worldObjectId} with path size ${command.data.path.size}")

        val worldObject = game.worldObjects.find { it.id == command.data.worldObjectId }
            ?: throw Exception("Could not find world object ${command.data.worldObjectId}")

        // skip empty paths
        if(command.data.path.isEmpty()) {
            return
        }

        // first tile in patch must match current location of object
        if (worldObject.tile.id != command.data.path.first().id) {
            throw Exception("World object not located at start of path ${worldObject.tile} vs ${command.data.path.first()}")
        }

        // step path as far as possible
        var currentTile = command.data.path.first()
        for (i in 1 until command.data.path.size) {
            val availableTiles = movementService.getAvailablePositions(game, worldObject, game.findTile(currentTile))
            val nextTile = command.data.path[i]
            if(!availableTiles.contains(nextTile)) {
                break
            }
            currentTile = nextTile
        }

        worldObject.tile = currentTile
    }

}
