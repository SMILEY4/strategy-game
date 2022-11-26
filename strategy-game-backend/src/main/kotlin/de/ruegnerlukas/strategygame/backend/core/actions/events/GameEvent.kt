package de.ruegnerlukas.strategygame.backend.core.actions.events

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

open class GameEvent(
    val gameEventType: GameEventType,
    val game: GameExtended
)

typealias GameEventType = String