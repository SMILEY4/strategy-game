package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventResourcesUpdate(
    game: GameExtended
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventResourcesUpdate::class.simpleName!!
    }

    override val gameEventType = TYPE

}