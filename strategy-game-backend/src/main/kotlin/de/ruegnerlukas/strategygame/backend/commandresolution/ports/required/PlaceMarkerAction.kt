package de.ruegnerlukas.strategygame.backend.commandresolution.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface PlaceMarkerAction {
    suspend fun perform(
        game: GameExtended,
        command: Command<PlaceMarkerCommandData>
    )
}