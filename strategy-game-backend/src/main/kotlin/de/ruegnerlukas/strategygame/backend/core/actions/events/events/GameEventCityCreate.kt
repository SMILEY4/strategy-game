package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province

class GameEventCityCreate(
    game: GameExtended,
    val country: Country,
    val province: Province,
    val city: City,
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCityCreate::class.simpleName!!
    }

    override val gameEventType = TYPE

}