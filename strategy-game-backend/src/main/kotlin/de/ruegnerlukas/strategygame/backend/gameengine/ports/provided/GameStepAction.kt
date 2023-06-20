package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command

interface GameStepAction {
    suspend fun perform(game: GameExtended, commands: List<Command<*>>)
}