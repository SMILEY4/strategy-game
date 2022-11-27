package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData

class PlaceMarkerCommandEvent(
    game: GameExtended,
    val command: Command<PlaceMarkerCommandData>
) : GameEvent(PlaceMarkerCommandEvent::class.simpleName!!, game)