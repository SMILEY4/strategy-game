package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO

interface GameStepAction {
    suspend fun perform(gameId: String, commands: List<Command<*>>, userIds: List<String>): Map<String, GameExtendedDTO>
}