package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province

data class RemoveProductionQueueEntryOperationData(
    val game: GameExtended,
    val country: Country,
    val province: Province,
    val city: City,
    val entryId: String
)