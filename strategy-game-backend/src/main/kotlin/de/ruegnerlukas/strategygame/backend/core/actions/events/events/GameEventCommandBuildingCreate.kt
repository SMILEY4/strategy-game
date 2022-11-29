package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class GameEventCommandBuildingCreate(
    game: GameExtended,
    val command: Command<CreateBuildingCommandData>
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCommandBuildingCreate::class.simpleName!!
    }

    override val gameEventType = GameEventCityCreate.TYPE

}