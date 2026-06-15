package io.github.smiley4.strategygame.engine.gameplay.domain

import io.github.smiley4.strategygame.engine.shared.WorldCounter
import io.github.smiley4.strategygame.shared.values.UserId

class GameStateContext(
    private val players: List<UserId>,
    private val counter: WorldCounter
) {
    fun getPlayers() = players
    fun getCounter() = counter
}
