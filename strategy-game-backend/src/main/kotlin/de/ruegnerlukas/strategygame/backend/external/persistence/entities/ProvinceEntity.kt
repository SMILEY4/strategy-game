package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection

class ProvinceEntity(
    val gameId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCityId: String,
    val resources: List<ResourceStack>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
            key = DbId.asDbId(serviceModel.provinceId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            cityIds = serviceModel.cityIds.toList(),
            provinceCityId = serviceModel.provinceCapitalCityId,
            resources = serviceModel.resourcesProducedPrevTurn.toStacks(),
        )

    }

    fun asServiceModel() = Province(
        provinceId = this.getKeyOrThrow(),
        countryId = this.countryId,
        cityIds = this.cityIds.toMutableList(),
        provinceCapitalCityId = this.provinceCityId,
        resourcesProducedPrevTurn = ResourceCollection.basic(this.resources),
        resourcesProducedCurrTurn = ResourceCollection.basic(),
        resourcesConsumedCurrTurn = ResourceCollection.basic(),
        resourcesMissing = ResourceCollection.basic(),
    )

}
