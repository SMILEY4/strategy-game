package io.github.smiley4.strategygame.backend.engine.application.core.commandexecution

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

class AddProductionQueueItemCommandExecutor : Logging {

    fun execute(gameState: GameState, command: Command<CommandData.AddProductionQueueItem>) {
        log().debug("Executing add production queue item command with object ${command.data.worldObject}.")

        // find world object
        val worldObject = gameState.worldObjects.find { it.id == command.data.worldObject }
            ?: throw Exception("Could not find world object ${command.data.worldObject}")

        // validate: world object must be owned by player
        val realm = gameState.realms.find { it.id == worldObject.realm }
            ?: throw Exception("Could not find realm ${worldObject.realm}")
        if (realm.user != command.user) {
            throw Exception("Player does not own world object.")
        }

        // validate: world object must have production component
        if(!worldObject.hasComponent<WorldObjectComponent.Production>()) {
            throw Exception("World Object does not have a production queue.")
        }

        // add item to queue
        val production = worldObject.getComponent<WorldObjectComponent.Production>()
        production.queue.add(command.data.item)

    }


}