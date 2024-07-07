package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.TileInfluence


internal class TileInfluenceEntity(
    val countryId: String,
    val provinceId: String,
    val cityId: String,
    val amount: Double,
) {

    companion object {
        fun of(serviceModel: TileInfluence) = TileInfluenceEntity(
            countryId = serviceModel.countryId,
            provinceId = serviceModel.provinceId,
            cityId = serviceModel.cityId,
            amount = serviceModel.amount

        )
    }

    fun asServiceModel() = TileInfluence(
        countryId = this.countryId,
        provinceId = this.provinceId,
        cityId = this.cityId,
        amount = this.amount
    )
}