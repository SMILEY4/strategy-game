package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province


data class RemoveProductionQueueEntryOperationData(
    val game: GameExtended,
    val country: Country,
    val province: Province,
    val city: City,
    val entryId: String
)