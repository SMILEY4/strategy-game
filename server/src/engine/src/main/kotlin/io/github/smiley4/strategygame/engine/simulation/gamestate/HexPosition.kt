package io.github.smiley4.strategygame.engine.simulation.gamestate

import kotlin.math.abs

data class HexPosition(
    val q: Int,
    val r: Int,
) {
    val s: Int get() = -q - r
}

operator fun HexPosition.plus(other: HexPosition): HexPosition {
    return HexPosition(
        this.q + other.q,
        this.r + other.r
    )
}

operator fun HexPosition.minus(other: HexPosition): HexPosition {
    return HexPosition(
        this.q - other.q,
        this.r - other.r
    )
}

operator fun HexPosition.times(other: HexPosition): HexPosition {
    return HexPosition(
        this.q * other.q,
        this.r * other.r
    )
}

operator fun HexPosition.div(other: HexPosition): HexPosition {
    return HexPosition(
        this.q / other.q,
        this.r / other.r
    )
}

fun HexPosition.distance(other: HexPosition): Int = this.distance(other.q, other.r)

fun HexPosition.distance(q: Int, r: Int): Int {
    val q = this.q - q
    val r = this.r - r
    return (abs(q) + abs(r) + abs(-q - r)) / 2
}

fun HexPosition.length(): Int {
    return (abs(this.q) + abs(this.r) + abs(this.s)) / 2
}


fun HexPosition.iterateCircle(radius: Int, consumer: (position: HexPosition) -> Unit) {
    for (iq in (this.q - radius)..(this.q + radius)) {
        for (ir in (this.r - radius)..(this.r + radius)) {
            if (this.distance(iq, ir) <= radius) {
                consumer(HexPosition(iq, ir))
            }
        }
    }
}