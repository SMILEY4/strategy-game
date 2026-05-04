package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.gameplay.data.WorldCounter
import io.github.smiley4.strategygame.shared.domain.UserId

class GameStateContext(
    private val players: List<UserId>,
    private val counter: WorldCounter
) {
    fun getPlayers() = players
    fun getCounter() = counter
}
