package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRefEntity,
    val name: String,
    val color: ColorEntity,
    val isProvinceCapital: Boolean,
    val buildings: List<BuildingEntity>,
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
            tile = TileRefEntity.of(serviceModel.tile),
            name = serviceModel.name,
            color = ColorEntity.of(serviceModel.color),
            isProvinceCapital = serviceModel.isProvinceCapital,
            buildings = serviceModel.buildings.map { BuildingEntity.of(it) },
            productionQueue = serviceModel.productionQueue.map { ProductionQueueEntryEntity.of(it) },
            size = serviceModel.size,
            growthProgress = serviceModel.growthProgress
        )
    }

    fun asServiceModel() = City(
        cityId = this.getKeyOrThrow(),
        countryId = this.countryId,
        tile = this.tile.asServiceModel(),
        name = this.name,
        color = this.color.toRGBColor(),
        isProvinceCapital = this.isProvinceCapital,
        buildings = this.buildings.map { it.asServiceModel() }.toMutableList(),
        productionQueue = this.productionQueue.map { it.asServiceModel() }.toMutableList(),
        size = this.size,
        growthProgress = this.growthProgress
    )

}
