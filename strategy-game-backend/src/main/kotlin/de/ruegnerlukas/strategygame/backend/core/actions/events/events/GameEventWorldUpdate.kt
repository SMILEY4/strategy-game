package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventWorldUpdate(
    game: GameExtended,
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventWorldUpdate::class.simpleName!!
    }

    override val gameEventType = GameEventBuildingCreate.TYPE

}