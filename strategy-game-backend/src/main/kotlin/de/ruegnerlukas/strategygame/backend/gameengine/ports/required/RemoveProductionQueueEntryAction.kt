package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueRemoveEntryCommandData

interface RemoveProductionQueueEntryAction {
    suspend fun performRemoveProductionQueueEntry(
        game: GameExtended,
        command: Command<ProductionQueueRemoveEntryCommandData>
    )
}