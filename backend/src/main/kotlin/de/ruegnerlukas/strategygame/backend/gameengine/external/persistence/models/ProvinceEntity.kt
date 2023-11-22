package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection

class ProvinceEntity(
    val gameId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCityId: String,
    val resources: List<ResourceStackEntity>,
    val color: ColorEntity,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
            key = DbId.asDbId(serviceModel.provinceId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            cityIds = serviceModel.cityIds.toList(),
            provinceCityId = serviceModel.provinceCapitalCityId,
            resources = serviceModel.resourcesProducedCurrTurn.toStacks().map { ResourceStackEntity.of(it) },
            color = ColorEntity.of(serviceModel.color),
        )

    }

    fun asServiceModel() = Province(
        provinceId = this.getKeyOrThrow(),
        countryId = this.countryId,
        cityIds = this.cityIds.toMutableList(),
        color = this.color.toRGBColor(),
        provinceCapitalCityId = this.provinceCityId,
        resourcesProducedPrevTurn = ResourceCollection.basic(this.resources.map { it.asServiceModel() }),
        resourcesProducedCurrTurn = ResourceCollection.basic(),
        resourcesConsumedCurrTurn = ResourceCollection.basic(),
        resourcesMissing = ResourceCollection.basic(),
    )

}
