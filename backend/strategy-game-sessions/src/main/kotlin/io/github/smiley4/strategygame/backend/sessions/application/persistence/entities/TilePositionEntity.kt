package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.TilePosition


internal class TilePositionEntity(
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