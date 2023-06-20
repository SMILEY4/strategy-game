package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceScoutCommandData

interface PlaceScoutAction {
    suspend fun performPlaceScout(
        game: GameExtended,
        command: Command<PlaceScoutCommandData>
    )
}