package de.ruegnerlukas.strategygame.backend.shared

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