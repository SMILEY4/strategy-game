package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventCityCreate(
    game: GameExtended,
    val createdCityId: String
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCityCreate::class.simpleName!!
    }

    override val gameEventType = TYPE

}