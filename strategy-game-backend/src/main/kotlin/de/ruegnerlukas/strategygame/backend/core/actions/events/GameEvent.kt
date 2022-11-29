package de.ruegnerlukas.strategygame.backend.core.actions.events

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

abstract class GameEvent(val game: GameExtended) {
    abstract val gameEventType: GameEventType
}
