package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.models.TileRef
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

data class CityDTO(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: List<BuildingDTO>,
    val productionQueue: List<ProductionQueueEntryDTO>,
    val size: Int,
    val growthProgress: Float // TODO: split city-dto into tiers -> hide prod-queue, growth-progress, buildings from other players ?
)
