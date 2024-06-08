package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import io.github.smiley4.strategygame.backend.common.models.TileRef


class TileRefEntity(
    val tileId: String,
    val q: Int,
    val r: Int
) {

    companion object {
        fun of(serviceModel: TileRef) = TileRefEntity(
            tileId = serviceModel.tileId,
            q = serviceModel.q,
            r = serviceModel.r
        )
    }

    fun asServiceModel() = TileRef(
        tileId = this.tileId,
        q = this.q,
        r = this.r
    )
}