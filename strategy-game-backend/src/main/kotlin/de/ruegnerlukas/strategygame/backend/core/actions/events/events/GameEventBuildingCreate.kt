package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventBuildingCreate(
    game: GameExtended,
    val country: Country,
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventBuildingCreate::class.simpleName!!
    }

    override val gameEventType = TYPE

}