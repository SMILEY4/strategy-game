package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class CreateBuildingEvent(
    game: GameExtended,
    val countryId: String,
) : GameEvent(CreateBuildingEvent::class.simpleName!!, game)