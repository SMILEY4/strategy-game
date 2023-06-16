package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.economy.ports.provided.EconomyUpdate

/**
 * Handles turn-income and turn-expenses
 */
class EconomyUpdateAction(private val economyUpdate: EconomyUpdate) : Logging {

    fun perform(game: GameExtended) {
        log().debug("Update economy")
        economyUpdate.update(game)
    }

}