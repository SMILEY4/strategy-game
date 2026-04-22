package io.github.smiley4.strategygame.platform.presence.infrastructure

import io.github.smiley4.strategygame.platform.presence.domain.PlayerPresence
import io.github.smiley4.strategygame.platform.presence.domain.PlayerPresenceRepository
import io.github.smiley4.strategygame.platform.presence.domain.PlayerPresenceSnapshot
import io.github.smiley4.strategygame.shared.UserId

internal class InMemoryPlayerPresenceRepository : PlayerPresenceRepository {

    private val presences = mutableMapOf<UserId, PlayerPresenceSnapshot>()

    override fun save(presence: PlayerPresence) {
        presences[presence.player] = presence.toSnapshot()
    }

    override fun findByPlayer(player: UserId): PlayerPresence? {
        return presences[player]?.let { PlayerPresence(it) }
    }

}