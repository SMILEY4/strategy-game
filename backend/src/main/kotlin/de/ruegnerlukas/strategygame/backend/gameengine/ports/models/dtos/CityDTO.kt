package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

class CityDTO(
    override val dataTier0: Unit = Unit,
    override val dataTier1: CityDataTier1,
    override val dataTier2: Unit = Unit,
    override val dataTier3: CityDataTier3?
): TieredDTO<Unit, CityDataTier1, Unit, CityDataTier3?>


data class CityDataTier1(
    val id: String,
    val name: String,
    val color: RGBColor,
    val countryId: String,
    val isCountryCapital: Boolean,
    val isProvinceCapital: Boolean,
    val tile: TileRef,
    val tier: String
)

data class CityDataTier3(
    val buildings: List<BuildingDTO>,
    val productionQueue: List<ProductionQueueEntryDTO>,
    val size: Int,
    val growthProgress: Float
)
