package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import de.ruegnerlukas.strategygame.backend.common.models.Building
import de.ruegnerlukas.strategygame.backend.common.models.TileRef
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: List<Building>,
    val productionQueue: List<ProductionQueueEntryEntity>,
    var size: Int,
    var growthProgress: Float,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: City, gameId: String) = CityEntity(
            key = DbId.asDbId(serviceModel.cityId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            tile = serviceModel.tile,
            name = serviceModel.name,
            color = serviceModel.color,
            isProvinceCapital = serviceModel.isProvinceCapital,
            buildings = serviceModel.buildings,
            productionQueue = serviceModel.productionQueue.map { ProductionQueueEntryEntity.of(it) },
            size = serviceModel.size,
            growthProgress = serviceModel.growthProgress
        )
    }

    fun asServiceModel() = City(
        cityId = this.getKeyOrThrow(),
        countryId = this.countryId,
        tile = this.tile,
        name = this.name,
        color = this.color,
        isProvinceCapital = this.isProvinceCapital,
        buildings = this.buildings.toMutableList(),
        productionQueue = this.productionQueue.map { it.asServiceModel() }.toMutableList(),
        size = this.size,
        growthProgress = this.growthProgress
    )

}
