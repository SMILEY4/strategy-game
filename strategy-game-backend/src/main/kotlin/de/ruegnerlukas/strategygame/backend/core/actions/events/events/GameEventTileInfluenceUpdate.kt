package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class GameEventTileInfluenceUpdate(
    game: GameExtended,
    val tiles: List<Tile>
) : GameEvent(game) {

    companion object {
        val TYPE: GameEventType = GameEventTileInfluenceUpdate::class.simpleName!!
    }

    override val gameEventType = GameEventBuildingCreate.TYPE

}