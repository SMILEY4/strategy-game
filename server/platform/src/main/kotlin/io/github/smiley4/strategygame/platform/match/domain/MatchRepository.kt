package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.shared.domain.UserId

internal interface MatchRepository {
    fun save(match: Match)
    fun delete(match: Match)
    fun findById(id: MatchId): Match?
    fun findByPlayer(id: UserId): List<Match>
}