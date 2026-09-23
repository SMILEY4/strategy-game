package io.github.smiley4.strategygame.engine.simulation.gamestate

import kotlin.random.Random

data class Color(
    val red: UByte,
    val green: UByte,
    val blue: UByte,
) {

    companion object {
        fun random(random: Random = Random.Default): Color = Color(
            red = random.nextChannel(),
            green = random.nextChannel(),
            blue = random.nextChannel(),
        )

        private fun Random.nextChannel(): UByte = nextInt(UByte.MAX_VALUE.toInt() + 1).toUByte()
    }
}
