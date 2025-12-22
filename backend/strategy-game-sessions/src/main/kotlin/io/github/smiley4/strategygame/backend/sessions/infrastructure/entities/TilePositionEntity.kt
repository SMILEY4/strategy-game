package io.github.smiley4.strategygame.backend.sessions.infrastructure.entities

import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TilePositionEntity(
    val q: Int,
    val r: Int
) {

    companion object {
        fun of(serviceModel: Tile.Position) = TilePositionEntity(
            q = serviceModel.q,
            r = serviceModel.r
        )
    }

    fun asServiceModel() = Tile.Position(
        q = this.q,
        r = this.r
    )
}