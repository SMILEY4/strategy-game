package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Prepares the game/world for the next update-step
 */
class WorldPrepareAction : Logging {

    fun perform(game: GameExtended) {
        log().debug("Prepare World")
//        game.provinces.forEach { province ->
//            province.resourcesProducedPrevTurn = ResourceCollection.basic(province.resourcesProducedCurrTurn)
//            province.resourcesConsumedCurrTurn = ResourceCollection.basic()
//            province.resourcesProducedCurrTurn = ResourceCollection.basic()
//            province.resourcesMissing = ResourceCollection.basic()
//        }
    }

}