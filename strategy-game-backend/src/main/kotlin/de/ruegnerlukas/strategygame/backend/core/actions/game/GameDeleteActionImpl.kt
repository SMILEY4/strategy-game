package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameDelete
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDeleteActionImpl(
    private val gameDelete: GameDelete,
) : GameDeleteAction, Logging {

    override suspend fun perform(gameId: String) {
        log().info("Deleting game $gameId")
        gameDelete.execute(gameId)
    }

}