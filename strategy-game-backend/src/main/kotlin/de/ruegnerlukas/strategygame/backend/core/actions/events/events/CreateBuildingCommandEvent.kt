package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class CreateBuildingCommandEvent(
    game: GameExtended,
    val command: Command<CreateBuildingCommandData>
) : GameEvent(CreateBuildingCommandEvent::class.simpleName!!, game)