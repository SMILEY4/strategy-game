package io.github.smiley4.strategygame.backend.common.models

data class TileRef(
    val tileId: String,
    val q: Int,
    val r: Int
) {
    constructor(tile: Tile) : this(tile.tileId, tile.position.q, tile.position.r)
}

fun Tile.ref() = TileRef(this.tileId, this.position.q, this.position.r)