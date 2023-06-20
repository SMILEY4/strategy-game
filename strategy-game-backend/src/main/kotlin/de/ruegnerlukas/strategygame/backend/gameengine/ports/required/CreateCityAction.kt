package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CreateCityCommandData

interface CreateCityAction {
    suspend fun performCreateCity(
        game: GameExtended,
        command: Command<CreateCityCommandData>
    )
}