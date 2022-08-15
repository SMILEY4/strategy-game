package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.hexDistance

data class TilePosition(
	var q: Int,
	var r: Int
)

fun TilePosition.distance(q: Int, r: Int): Int {
	return hexDistance(this.q, this.r, q, r)
}

fun TilePosition.distance(pos: TileRef): Int {
	return hexDistance(this.q, this.r, pos.q, pos.r)
}

fun TilePosition.distance(pos: TilePosition): Int {
	return hexDistance(this.q, this.r, pos.q, pos.r)
}