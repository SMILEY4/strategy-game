package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended


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