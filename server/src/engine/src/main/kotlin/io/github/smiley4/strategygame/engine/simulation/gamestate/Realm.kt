package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.random.Random

data class Realm(
    val id: Id,
    val user: UserId,
) {

    @JvmInline
    value class Id(val id: Int = Random.nextInt(from = 1, until = Int.MAX_VALUE))

}