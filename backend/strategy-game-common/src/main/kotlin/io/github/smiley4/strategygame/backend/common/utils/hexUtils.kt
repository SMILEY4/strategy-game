package io.github.smiley4.strategygame.backend.common.utils

import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.TileRef
import kotlin.math.abs

/**
 * @return the s-component of the hex-coords
 */
fun hexS(q: Int, r: Int): Int {
    return -q - r
}


/**
 * @return hex0 + hex1
 */
fun hexAdd(q0: Int, r0: Int, q1: Int, r1: Int): Pair<Int, Int> {
    return Pair(
        q0 + q1,
        r0 + r1
    )
}


/**
 * @return hex0 - hex1
 */
fun hexSub(q0: Int, r0: Int, q1: Int, r1: Int): Pair<Int, Int> {
    return Pair(
        q0 - q1,
        r0 - r1
    )
}


/**
 * @return hex0 * hex1
 */
fun hexMul(q0: Int, r0: Int, q1: Int, r1: Int): Pair<Int, Int> {
    return Pair(
        q0 * q1,
        r0 * r1
    )
}


/**
 * @return hex * k
 */
fun hexMul(q: Int, r: Int, k: Int): Pair<Int, Int> {
    return Pair(
        q * k,
        r * k
    )
}


/**
 * @return |hex|
 */
fun hexLength(q: Int, r: Int): Int {
    return (abs(q) + abs(r) + abs(hexS(q, r))) / 2
}


/**
 * @return distance hex0 - hex1
 */
fun hexDistance(q0: Int, r0: Int, q1: Int, r1: Int): Int {
    val d = hexSub(q0, r0, q1, r1)
    return hexLength(d.first, d.second)
}


/**
 * @return all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(center: TileRef, radius: Int): List<TilePosition> {
    return positionsCircle(center.q, center.r, radius)
}


/**
 * @return all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(center: TilePosition, radius: Int): List<TilePosition> {
    return positionsCircle(center.q, center.r, radius)
}


/**
 * @return all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(centerQ: Int, centerR: Int, radius: Int): List<TilePosition> {
    return mutableListOf<TilePosition>().apply {
        positionsCircle(centerQ, centerR, radius) { q, r ->
            add(TilePosition(q, r))
        }
    }
}


/**
 * iterate over all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(center: TileRef, radius: Int, consumer: (q: Int, r: Int) -> Unit) {
    return positionsCircle(center.q, center.r, radius, consumer)
}


/**
 * iterate over all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(center: TilePosition, radius: Int, consumer: (q: Int, r: Int) -> Unit) {
    return positionsCircle(center.q, center.r, radius, consumer)
}


/**
 * iterate over all [TilePosition]s that lie inside the given circle
 */
fun positionsCircle(centerQ: Int, centerR: Int, radius: Int, consumer: (q: Int, r: Int) -> Unit) {
    for (iq in (centerQ - radius)..(centerQ + radius)) {
        for (ir in (centerR - radius)..(centerR + radius)) {
            if (hexDistance(centerQ, centerR, iq, ir) <= radius) {
                consumer(iq, ir)
            }
        }
    }
}


/**
 * iterate over all tile positions that are neighbours of the given tile position
 */
fun positionsNeighbours(pos: TilePosition, consumer: (q: Int, r: Int) -> Unit) {
    positionsNeighbours(pos.q, pos.r, consumer)
}


/**
 * iterate over all tile positions that are neighbours of the given tile position
 */
fun positionsNeighbours(q: Int, r: Int, consumer: (q: Int, r: Int) -> Unit) {
    consumer(q - 1, r + 0)
    consumer(q + 1, r + 0)
    consumer(q - 1, r + 1)
    consumer(q + 0, r + 1)
    consumer(q + 0, r - 1)
    consumer(q + 1, r - 1)
}


/**
 * @return all tile positions that are neighbours of the given tile position
 */
fun getNeighbourPositions(q: Int, r: Int): List<Pair<Int, Int>> {
    return mutableListOf<Pair<Int, Int>>().also { positions ->
        positionsNeighbours(q, r) { nq, nr -> positions.add(nq to nr) }
    }
}