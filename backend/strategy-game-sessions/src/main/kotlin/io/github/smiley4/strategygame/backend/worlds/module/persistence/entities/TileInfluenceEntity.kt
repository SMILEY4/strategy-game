package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TileInfluenceEntity(
    val countryId: String,
    val provinceId: String,
    val settlementId: String,
    val amount: Double,
) {

    companion object {
        fun of(serviceModel: Tile.Influence) = TileInfluenceEntity(
            countryId = serviceModel.country.value,
            provinceId = serviceModel.province.value,
            settlementId = serviceModel.settlement.value,
            amount = serviceModel.amount

        )
    }

    fun asServiceModel() = Tile.Influence(
        country = Country.Id(this.countryId),
        province = Province.Id(this.provinceId),
        settlement = Settlement.Id(this.settlementId),
        amount = this.amount
    )
}