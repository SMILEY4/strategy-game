package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended


data class AddProductionQueueEntryOperationData(
    val game: GameExtended,
    val country: Country,
    val city: City,
    val entry: ProductionQueueEntryData
)

sealed class ProductionQueueEntryData

class BuildingProductionQueueEntryData(
    val buildingType: BuildingType
): ProductionQueueEntryData()


class SettlerProductionQueueEntryData: ProductionQueueEntryData()