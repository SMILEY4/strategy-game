package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats

/**
 * Prepares the game/world for the next update-step
 */
class WorldPrepareAction {

    fun perform(game: GameExtended) {
        game.provinces.forEach { province ->
            province.resourcesProducedPrevTurn = ResourceStats.from(province.resourcesProducedCurrTurn)
            province.resourcesConsumedCurrTurn = ResourceStats()
            province.resourcesProducedCurrTurn = ResourceStats()
            province.resourcesMissing = ResourceStats()
        }
    }

}