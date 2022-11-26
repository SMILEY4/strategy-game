package de.ruegnerlukas.strategygame.backend.core.actions.events.events

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class CreateCityCommandEvent(
    game: GameExtended,
    val command: Command<CreateCityCommandData>
) : GameEvent(CreateCityCommandEvent::class.simpleName!!, game)