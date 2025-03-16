package io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended

internal class ResolveDisbandWorldObject : Logging {

    fun resolve(game: GameExtended, command: Command<CommandData.DisbandWorldObject>) {
        log().debug("Resolving disband world-object command for object ${command.data.worldObject}")
        val worldObject = game.findWorldObject(command.data.worldObject)
        game.worldObjects.remove(worldObject)
    }

}