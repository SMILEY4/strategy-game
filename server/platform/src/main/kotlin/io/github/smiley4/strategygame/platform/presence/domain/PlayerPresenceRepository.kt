package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.shared.UserId

internal interface PlayerPresenceRepository {
    fun save(presence: PlayerPresence)
    fun findByPlayer(player: UserId): PlayerPresence?
}