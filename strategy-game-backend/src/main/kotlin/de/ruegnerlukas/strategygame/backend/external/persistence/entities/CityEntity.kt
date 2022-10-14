package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val city: Boolean,
    val parentCity: String?,
    val buildings: List<Building>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: City) = CityEntity(
            key = DbId.asDbId(serviceModel.cityId),
            gameId = serviceModel.gameId,
            countryId = serviceModel.countryId,
            tile = serviceModel.tile,
            name = serviceModel.name,
            color = serviceModel.color,
            city = serviceModel.city,
            parentCity = serviceModel.parentCity,
            buildings = serviceModel.buildings,
        )
    }

    fun asServiceModel() = City(
        cityId = this.getKeyOrThrow(),
        gameId = this.gameId,
        countryId = this.countryId,
        tile = this.tile,
        name = this.name,
        color = this.color,
        city = this.city,
        parentCity = this.parentCity,
        buildings = this.buildings.toMutableList(),
    )

}
