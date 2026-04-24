package io.github.smiley4.strategygame.platform.presence

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId


interface PlayerPresenceService {
    suspend fun connect(player: UserId, gameId: GameId)
    suspend fun disconnect(player: UserId)
}