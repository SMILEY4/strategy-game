package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPrepare
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedger

/**
 * Prepares the game/world for the next update-step
 * - triggered by [GameEventWorldPrepare]
 * - triggers nothing
 */
class GameActionWorldPrepare : GameAction<GameEventWorldPrepare>(GameEventWorldPrepare.TYPE) {

    override suspend fun perform(event: GameEventWorldPrepare): List<GameEvent> {
        event.game.provinces.forEach { province ->
            province.resourceLedgerPrevTurn = province.resourceLedgerCurrTurn
            province.resourceLedgerCurrTurn = ResourceLedger()
        }
        return listOf()
    }

}