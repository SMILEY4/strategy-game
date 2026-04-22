package io.github.smiley4.strategygame.platform.presence

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.domain.GameId

interface PlayerPresenceService {
    fun connect(player: UserId, gameId: GameId)
    fun disconnect(player: UserId)
}