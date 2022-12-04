package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventCommandCityCreate(
    game: GameExtended,
    val command: Command<CreateCityCommandData>
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCommandCityCreate::class.simpleName!!
    }

    override val gameEventType = TYPE

}