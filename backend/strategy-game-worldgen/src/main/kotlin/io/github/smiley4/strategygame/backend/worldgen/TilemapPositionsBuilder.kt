package io.github.smiley4.strategygame.backend.worldgen

import io.github.smiley4.strategygame.backend.common.models.TilePosition
import java.lang.Integer.min
import kotlin.math.floor
import kotlin.math.max


/**
 * Builds the positions of tilemaps with hex-shapes tiles
 * (see https://www.redblobgames.com/grids/hexagons/implementation.html#map-shapes)
 */
class TilemapPositionsBuilder {

	/**
	 * Creates the positions for a tilemap in the shape of a parallelogram
	 * @param minQ the min coordinate for the q-axis (inclusive)
	 * @param maxQ the max coordinate for the q-axis (inclusive)
	 * @param minR the min coordinate for the r-axis (inclusive)
	 * @param maxR the max coordinate for the r-axis (inclusive)
	 * @return the list of tile-positions
	 */
	fun createParallelogram(
		minQ: Int,
		maxQ: Int,
		minR: Int,
		maxR: Int
	): List<TilePosition> {
		return positions {
			for (q in minQ..maxQ) {
				for (r in minR..maxR) {
					it.add(TilePosition(q, r))
				}
			}
		}
	}


	/**
	 * Creates the positions for a tilemap in the shape of a triangle pointing up/right for hexagon-tiles with a pointy/flat top
	 * @param size the number of tiles on each side of the triangle
	 * @return the list of tile-positions
	 */
	fun createTriangleTypeA(size: Int): List<TilePosition> {
		return positions {
			for (q in 0 until size) {
				for (r in 0 until (size - q)) {
					it.add(TilePosition(q, r))
				}
			}
		}
	}


	/**
	 * Creates the positions for a tilemap in the shape of a triangle pointing down/left for hexagon-tiles with a pointy/flat top
	 * @param size the number of tiles on each side of the triangle
	 * @return the list of tile-positions
	 */
	fun createTriangleTypeB(size: Int): List<TilePosition> {
		return positions {
			for (q in 0 until size) {
				for (r in (size - q)..size) {
					it.add(TilePosition(q, r))
				}
			}
		}
	}


	/**
	 * Creates the positions for a tilemap in the shape of a hexagon with a given radius
	 * @param radius the radius of the hexagon
	 * @return the list of tile-positions
	 */
	fun createHexagon(radius: Int): List<TilePosition> {
		return positions {
			for (q in -radius..radius) {
				val r1 = max(-radius, -q - radius)
				val r2 = min(radius, -q + radius)
				for (r in r1..r2) {
					it.add(TilePosition(q, r))
				}
			}
		}
	}


	/**
	 * Creates the positions for a tilemap in the shape of a rectangle (use for hex-tiles with a pointy top)
	 * @param top the coordinate of the top side (inclusive)
	 * @param bottom the coordinate of the bottom side (inclusive)
	 * @param left the coordinate of the left side (inclusive)
	 * @param right the coordinate of the right side (inclusive)
	 * @return the list of tile-positions
	 */
	fun createRectanglePointyTop(top: Int, bottom: Int, left: Int, right: Int): List<TilePosition> {
		return createRectangle(top, bottom, left, right, false)
	}


	/**
	 * Creates the positions for a tilemap in the shape of a rectangle (use for hex-tiles with a flat top)
	 * @param top the coordinate of the top side (inclusive)
	 * @param bottom the coordinate of the bottom side (inclusive)
	 * @param left the coordinate of the left side (inclusive)
	 * @param right the coordinate of the right side (inclusive)
	 * @return the list of tile-positions
	 */
	fun createRectangleFlatTop(top: Int, bottom: Int, left: Int, right: Int): List<TilePosition> {
		return createRectangle(left, right, top, bottom, true)
	}


	/**
	 * Creates the positions for a tilemap in the shape of a rectangle independent of tile shape
	 * @param i0 the min value of the outer loop (inclusive)
	 * @param i1 the max value of the outer loop (inclusive)
	 * @param j0 the min value of the inner loop (inclusive)
	 * @param j1 the max value of the inner loop (inclusive)
	 * @return the list of tile-positions
	 */
	private fun createRectangle(i0: Int, i1: Int, j0: Int, j1: Int, iIsQ: Boolean): List<TilePosition> {
		return positions {
			for (i in i0..i1) {
				val iOffset = floor(i / 2.0).toInt()
				for (j in (j0 - iOffset)..(j1 - iOffset)) {
					it.add(
						TilePosition(
							if (iIsQ) i else j,
							if (iIsQ) j else i
						)
					)
				}
			}
		}
	}


	private fun positions(factory: (MutableList<TilePosition>) -> Unit): List<TilePosition> {
		return mutableListOf<TilePosition>().also(factory)
	}

}