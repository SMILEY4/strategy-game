package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

/**
 * Handles turn-income and turn-expenses
 */
class EconomyUpdateAction(private val gameConfig: GameConfig) {

    fun perform(game: GameExtended) {
        EconomyUpdate(gameConfig).update(game)
    }

}
