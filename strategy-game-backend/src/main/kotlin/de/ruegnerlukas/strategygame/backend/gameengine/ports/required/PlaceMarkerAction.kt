package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceMarkerCommandData

interface PlaceMarkerAction {
    suspend fun performPlaceMarker(
        game: GameExtended,
        command: Command<PlaceMarkerCommandData>
    )
}