package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class ProvinceEntity(
    val gameId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCityId: String,
    val resourceBalance: Map<ResourceType, Float>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
            key = DbId.asDbId(serviceModel.provinceId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            cityIds = serviceModel.cityIds.toList(),
            provinceCityId = serviceModel.provinceCapitalCityId,
            resourceBalance = serviceModel.resourceBalance
        )
    }

    fun asServiceModel() = Province(
        provinceId = this.getKeyOrThrow(),
        countryId = this.countryId,
        cityIds = this.cityIds.toMutableList(),
        provinceCapitalCityId = this.provinceCityId,
        resourceBalance = this.resourceBalance.toMutableMap()
    )

}
