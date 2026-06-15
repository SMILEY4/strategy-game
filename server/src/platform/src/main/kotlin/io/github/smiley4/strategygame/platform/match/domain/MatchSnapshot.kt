package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId


internal data class MatchSnapshot(
    val id: MatchId,
    val name: String,
    val participants: List<MatchParticipantSnapshot>,
    val state: MatchState,
    val gameId: GameId?,
)

internal data class MatchParticipantSnapshot(
    val userId: UserId,
    val role: MatchParticipantRole,
)