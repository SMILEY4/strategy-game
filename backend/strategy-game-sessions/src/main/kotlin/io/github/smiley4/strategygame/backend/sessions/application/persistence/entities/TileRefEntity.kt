package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TileRefEntity(
    val tileId: String,
    val q: Int,
    val r: Int
) {

    companion object {
        fun of(serviceModel: Tile.Ref) = TileRefEntity(
            tileId = serviceModel.id.value,
            q = serviceModel.position.q,
            r = serviceModel.position.r
        )
    }

    fun asServiceModel() = Tile.Ref(
        id = Tile.Id(this.tileId),
        position = Tile.Position(
            q = this.q,
            r = this.r
        ),
    )
}