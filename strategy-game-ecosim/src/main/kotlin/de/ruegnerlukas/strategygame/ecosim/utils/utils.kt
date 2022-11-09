package de.ruegnerlukas.strategygame.ecosim.utils

import java.util.Random

fun Random.nextIntBetweenInclusive(bounds: Pair<Int, Int>): Int {
    return this.nextInt(bounds.second - bounds.first + 1) + bounds.first
}

fun Float.formatPercentage(): String {
    return "%.2f".format(this * 100) + "%"
}

fun Double.formatPercentage(): String {
    return "%.2f".format(this * 100) + "%"
}