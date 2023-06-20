package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueAddEntryCommandData

interface AddProductionQueueEntryAction {
    suspend fun performAddProductionQueueEntry(
        game: GameExtended,
        command: Command<ProductionQueueAddEntryCommandData>
    )
}