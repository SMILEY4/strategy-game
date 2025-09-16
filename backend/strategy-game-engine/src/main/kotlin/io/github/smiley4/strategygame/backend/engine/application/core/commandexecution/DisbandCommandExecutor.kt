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

class DisbandCommandExecutor : Logging {

    fun execute(gameState: GameState, command: Command<CommandData.Disband>) {
        log().debug("Executing disband command for object ${command.data.worldObject}.")

        // find world object to disband
        val worldObject = gameState.worldObjects.find { it.id == command.data.worldObject }
            ?: throw Exception("Could not find world object ${command.data.worldObject}")

        // validate: world object must be owned by player
        val realm = gameState.realms.find { it.id == worldObject.realm }
            ?: throw Exception("Could not find realm ${worldObject.realm}")
        if (realm.user != command.user) {
            throw Exception("Player does not own world object.")
        }

        // delete world object
        gameState.worldObjects.remove(worldObject)
    }

}