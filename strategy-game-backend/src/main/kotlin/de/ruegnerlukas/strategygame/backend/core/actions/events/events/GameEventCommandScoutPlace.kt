package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData

class GameEventCommandScoutPlace(
    game: GameExtended,
    val command: Command<PlaceScoutCommandData>
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventCommandScoutPlace::class.simpleName!!
    }

    override val gameEventType = TYPE

}