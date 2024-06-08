package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import io.github.smiley4.strategygame.backend.common.persistence.DbId
import io.github.smiley4.strategygame.backend.common.persistence.arango.DbEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.ResourceLedgerEntity.Companion.asServiceModel
import io.github.smiley4.strategygame.backend.engine.ports.models.Province


class ProvinceEntity(
    val gameId: String,
    val countryId: String,
    val cityIds: List<String>,
    val provinceCityId: String,
    val resourceLedger: ResourceLedgerEntity,
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
            resourceLedger = ResourceLedgerEntity.of(serviceModel.resourceLedger),
            color = ColorEntity.of(serviceModel.color),
        )

    }

    fun asServiceModel() = Province(
        provinceId = this.getKeyOrThrow(),
        countryId = this.countryId,
        cityIds = this.cityIds.toMutableList(),
        color = this.color.toRGBColor(),
        provinceCapitalCityId = this.provinceCityId,
        resourceLedger = this.resourceLedger.asServiceModel()
    )

}
