package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

class TilePositionEntity(
    val q: Int,
    val r: Int
) {

    companion object {
        fun of(serviceModel: TilePosition) = TilePositionEntity(
            q = serviceModel.q,
            r = serviceModel.r
        )
    }

    fun asServiceModel() = TilePosition(
        q = this.q,
        r = this.r
    )
}