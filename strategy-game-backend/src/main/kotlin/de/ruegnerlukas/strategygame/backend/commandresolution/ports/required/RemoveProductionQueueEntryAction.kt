package de.ruegnerlukas.strategygame.backend.commandresolution.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface RemoveProductionQueueEntryAction {
    suspend fun performRemoveProductionQueueEntry(
        game: GameExtended,
        command: Command<ProductionQueueRemoveEntryCommandData>
    )
}