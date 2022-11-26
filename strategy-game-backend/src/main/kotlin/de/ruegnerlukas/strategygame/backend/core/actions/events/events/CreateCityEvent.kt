package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class CreateCityEvent(
    game: GameExtended,
    val createdCityId: String
) : GameEvent(CreateCityEvent::class.simpleName!!, game)