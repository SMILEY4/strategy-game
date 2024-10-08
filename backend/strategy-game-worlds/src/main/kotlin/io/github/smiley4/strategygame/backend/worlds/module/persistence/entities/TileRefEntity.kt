package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.TileRef


internal class TileRefEntity(
    val tileId: String,
    val q: Int,
    val r: Int
) {

    companion object {
        fun of(serviceModel: TileRef) = TileRefEntity(
            tileId = serviceModel.id,
            q = serviceModel.q,
            r = serviceModel.r
        )
    }

    fun asServiceModel() = TileRef(
        id = this.tileId,
        q = this.q,
        r = this.r
    )
}