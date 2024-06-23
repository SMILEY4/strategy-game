package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province


data class RemoveProductionQueueEntryOperationData(
    val game: GameExtended,
    val country: Country,
    val province: Province,
    val city: City,
    val entryId: String
)