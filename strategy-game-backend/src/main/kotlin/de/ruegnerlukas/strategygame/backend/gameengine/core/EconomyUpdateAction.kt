package de.ruegnerlukas.strategygame.backend.gameengine.core

/**
 * Handles turn-income and turn-expenses
 */
class EconomyUpdateAction(private val economyUpdate: EconomyUpdate) : Logging {

    fun perform(game: GameExtended) {
        log().debug("Update economy")
        economyUpdate.update(game)
    }

}