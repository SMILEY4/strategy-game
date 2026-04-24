package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

internal data class PlayerPresenceSnapshot(
    val player: UserId,
    val connectedGame: GameId?,
)