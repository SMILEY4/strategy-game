package io.github.smiley4.strategygame.backend.common.utils

import io.github.smiley4.strategygame.backend.commondata.Tile


fun Tile.Ref.distance(q: Int, r: Int): Int {
    return hexDistance(this.position.q, this.position.r, q, r)
}

fun Tile.Ref.distance(pos: Tile.Ref): Int {
    return hexDistance(this.position.q, this.position.r, pos.position.q, pos.position.r)
}

fun Tile.Ref.distance(pos: Tile.Position): Int {
    return hexDistance(this.position.q, this.position.r, pos.q, pos.r)
}

fun Tile.Position.distance(q: Int, r: Int): Int {
    return hexDistance(this.q, this.r, q, r)
}

fun Tile.Position.distance(pos: Tile.Ref): Int {
    return hexDistance(this.q, this.r, pos.position.q, pos.position.r)
}

fun Tile.Position.distance(pos: Tile.Position): Int {
    return hexDistance(this.q, this.r, pos.q, pos.r)
}