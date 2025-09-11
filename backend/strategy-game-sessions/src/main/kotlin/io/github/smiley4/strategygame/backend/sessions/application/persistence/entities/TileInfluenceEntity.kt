package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TileInfluenceEntity(
    val countryId: String,
    val settlementId: String,
    val amount: Double,
) {

    companion object {
        fun of(serviceModel: Tile.Influence) = TileInfluenceEntity(
            countryId = serviceModel.country.value,
            settlementId = serviceModel.settlement.value,
            amount = serviceModel.amount

        )
    }

    fun asServiceModel() = Tile.Influence(
        country = Country.Id(this.countryId),
        settlement = Settlement.Id(this.settlementId),
        amount = this.amount
    )
}