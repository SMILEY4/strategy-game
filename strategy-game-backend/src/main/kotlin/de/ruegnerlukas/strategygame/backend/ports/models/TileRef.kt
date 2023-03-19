package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.hexDistance

data class TileRef(
	val tileId: String,
	val q: Int,
	val r: Int
)

fun TileRef.distance(q: Int, r: Int): Int {
	return hexDistance(this.q, this.r, q, r)
}

fun TileRef.distance(pos: TileRef): Int {
	return hexDistance(this.q, this.r, pos.q, pos.r)
}

fun TileRef.distance(pos: TilePosition): Int {
	return hexDistance(this.q, this.r, pos.q, pos.r)
}