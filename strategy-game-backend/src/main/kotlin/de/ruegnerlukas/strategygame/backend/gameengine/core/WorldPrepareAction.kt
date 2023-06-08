package de.ruegnerlukas.strategygame.backend.gameengine.core

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