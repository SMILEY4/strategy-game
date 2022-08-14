package de.ruegnerlukas.strategygame.backend.ports.models

import kotlin.math.sqrt

data class TileRef(
	val tileId: String,
	val q: Int,
	val r: Int
)

fun TileRef.distance(q: Int, r: Int): Double {
	val dq = q - this.q
	val dr = r - this.r
	return sqrt((dq * dq + dr * dr).toDouble())
}

fun TileRef.distance(pos: TileRef): Double {
	val dq = pos.q - this.q
	val dr = pos.r - this.r
	return sqrt((dq * dq + dr * dr).toDouble())
}

fun TileRef.distance(pos: TilePosition): Double {
	val dq = pos.q - this.q
	val dr = pos.r - this.r
	return sqrt((dq * dq + dr * dr).toDouble())
}