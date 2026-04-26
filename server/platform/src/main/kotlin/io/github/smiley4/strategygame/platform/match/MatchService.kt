package io.github.smiley4.strategygame.platform.match

import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId


interface MatchService {
    fun create(user: UserId, name: String): MatchId
    suspend fun join(user: UserId, matchId: MatchId)
    suspend fun delete(user: UserId, matchId: MatchId)
    suspend fun generateGame(user: UserId, matchId: MatchId)
    fun listMatches(user: UserId): List<MatchId>
}