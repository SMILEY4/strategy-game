package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileOwner

data class TileOwnerEntity(
    val countryId: String,
    val provinceId: String,
    val cityId: String?
) {

    companion object {
        fun of(serviceModel: TileOwner) = TileOwnerEntity(
            countryId = serviceModel.countryId,
            provinceId = serviceModel.provinceId,
            cityId = serviceModel.cityId
        )
    }

    fun asServiceModel() = TileOwner(
        countryId = this.countryId,
        provinceId = this.provinceId,
        cityId = this.cityId
    )

}