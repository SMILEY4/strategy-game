package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class TileInfluenceUpdateEvent(
    game: GameExtended,
    val tiles: List<Tile>
) : GameEvent(TileInfluenceUpdateEvent::class.simpleName!!, game)