package io.github.smiley4.strategygame.engine.simulation.gamestate

import kotlin.math.abs

data class HexPosition(
    val q: Int,
    val r: Int,
) {
    val s: Int get() = -q - r
}

fun HexPosition.distance(other: HexPosition): Int {
    val q = this.q - other.q
    val r = this.r - other.r
    return (abs(q) + abs(r) + abs(-q-r)) / 2
}