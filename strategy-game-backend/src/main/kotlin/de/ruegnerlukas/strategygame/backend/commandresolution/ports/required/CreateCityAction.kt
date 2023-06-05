package de.ruegnerlukas.strategygame.backend.commandresolution.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface CreateCityAction {
    suspend fun perform(
        game: GameExtended,
        command: Command<CreateCityCommandData>
    )
}