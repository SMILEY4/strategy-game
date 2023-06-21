package de.ruegnerlukas.strategygame.backend.common.models

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

class City(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: MutableList<Building>,
    val productionQueue: MutableList<ProductionQueueEntry>,
    var size: Int,
    var growthProgress: Float,
    var popConsumedFood: Float = 0f,
    var popGrowthConsumedFood: Boolean = false
)