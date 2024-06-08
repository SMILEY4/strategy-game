package io.github.smiley4.strategygame.backend.common.utils

import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.TileRef

fun TileRef.distance(q: Int, r: Int): Int {
    return hexDistance(this.q, this.r, q, r)
}

fun TileRef.distance(pos: TileRef): Int {
    return hexDistance(this.q, this.r, pos.q, pos.r)
}

fun TileRef.distance(pos: TilePosition): Int {
    return hexDistance(this.q, this.r, pos.q, pos.r)
}

fun TilePosition.distance(q: Int, r: Int): Int {
    return hexDistance(this.q, this.r, q, r)
}

fun TilePosition.distance(pos: TileRef): Int {
    return hexDistance(this.q, this.r, pos.q, pos.r)
}

fun TilePosition.distance(pos: TilePosition): Int {
    return hexDistance(this.q, this.r, pos.q, pos.r)
}