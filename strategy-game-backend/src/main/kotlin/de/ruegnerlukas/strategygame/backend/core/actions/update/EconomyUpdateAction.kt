package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Handles turn-income and turn-expenses
 */
class EconomyUpdateAction(private val gameConfig: GameConfig, private val popFoodConsumption: PopFoodConsumption): Logging {

    fun perform(game: GameExtended) {
        log().debug("Update economy")
        EconomyUpdate(gameConfig, popFoodConsumption).update(game)
    }

}
