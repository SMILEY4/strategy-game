package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class WorldUpdateEvent(
    game: GameExtended,
) : GameEvent(WorldUpdateEvent::class.simpleName!!, game)