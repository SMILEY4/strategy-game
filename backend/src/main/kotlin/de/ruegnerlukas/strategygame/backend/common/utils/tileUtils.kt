package de.ruegnerlukas.strategygame.backend.common.utils

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

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