package de.ruegnerlukas.strategygame.backend.commandresolution.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface AddProductionQueueEntryAction {
    suspend fun performAddProductionQueueEntry(
        game: GameExtended,
        command: Command<ProductionQueueAddEntryCommandData>
    )
}