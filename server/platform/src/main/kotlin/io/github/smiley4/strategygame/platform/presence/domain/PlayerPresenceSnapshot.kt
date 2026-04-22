package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.domain.GameId

internal data class PlayerPresenceSnapshot(
    val player: UserId,
    val connectedGame: GameId?,
)