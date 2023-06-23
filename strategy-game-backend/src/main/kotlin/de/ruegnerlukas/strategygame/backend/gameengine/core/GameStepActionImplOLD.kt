package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStepAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd

class GameStepActionImplOLD(
    private val actionResolveCommands: ResolveCommandsAction,
    private val turnUpdate: TurnUpdateAction
) : GameStepAction {

    override suspend fun perform(game: GameExtended, commands: List<Command<*>>) {
        turnUpdate.prepare(game)
        actionResolveCommands.perform(game, commands).mapLeft { TurnEnd.CommandResolutionFailedError }
        turnUpdate.globalUpdate(game)
    }

}