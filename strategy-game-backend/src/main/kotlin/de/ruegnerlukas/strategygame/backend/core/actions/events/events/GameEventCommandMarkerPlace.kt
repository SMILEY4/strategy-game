package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData

class GameEventCommandMarkerPlace(
    game: GameExtended,
    val command: Command<PlaceMarkerCommandData>
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCommandMarkerPlace::class.simpleName!!
    }

    override val gameEventType = TYPE

}