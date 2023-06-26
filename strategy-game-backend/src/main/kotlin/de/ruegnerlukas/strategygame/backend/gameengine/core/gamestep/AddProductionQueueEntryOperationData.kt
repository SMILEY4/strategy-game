package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

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