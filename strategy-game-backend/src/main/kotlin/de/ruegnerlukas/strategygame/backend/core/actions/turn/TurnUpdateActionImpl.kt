package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction

class TurnUpdateActionImpl(
    private val gameEventManager: GameEventManager
) : TurnUpdateAction {

    private val metricId = metricCoreAction(TurnUpdateAction::class)

    override suspend fun perform(game: GameExtended) {
        Monitoring.coTime(metricId) {
            gameEventManager.send(GameEventWorldUpdate::class.simpleName!!, GameEventWorldUpdate(game))
        }
    }

}