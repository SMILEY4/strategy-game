package io.github.smiley4.strategygame.platform.presence

import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId


interface PlayerPresenceService {
    fun connect(player: UserId, gameId: GameId)
    fun disconnect(player: UserId)
}