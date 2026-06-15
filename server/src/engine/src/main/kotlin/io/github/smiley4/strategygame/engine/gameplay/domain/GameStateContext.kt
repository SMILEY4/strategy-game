package io.github.smiley4.strategygame.engine.gameplay.domain

import io.github.smiley4.strategygame.engine.shared.WorldCounter
import io.github.smiley4.strategygame.shared.values.UserId

class GameStateContext(
    private val counter: WorldCounter
) {
    fun getCounter() = counter
}
