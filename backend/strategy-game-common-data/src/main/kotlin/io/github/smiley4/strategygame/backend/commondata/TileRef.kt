package io.github.smiley4.strategygame.backend.commondata


data class TileRef(
    val id: Tile.Id,
    val q: Int,
    val r: Int
) {
    constructor(tile: Tile) : this(tile.id, tile.position.q, tile.position.r)
}

fun Tile.ref() = TileRef(this.id, this.position.q, this.position.r)