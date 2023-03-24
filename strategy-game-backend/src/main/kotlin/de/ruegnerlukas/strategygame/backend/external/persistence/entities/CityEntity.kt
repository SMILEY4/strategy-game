package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: List<Building>,
    val productionQueue: List<ProductionQueueEntryEntity>,
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
            productionQueue = serviceModel.productionQueue.map { ProductionQueueEntryEntity(it.buildingType, it.collectedResources) }
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
        productionQueue = this.productionQueue.map { ProductionQueueEntry(it.buildingType, it.collectedResources) }.toMutableList()
    )

}
