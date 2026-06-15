package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.shared.values.UserId

class MatchParticipant(
    val user: UserId,
    val role: MatchParticipantRole,
)

enum class MatchParticipantRole {
    OWNER,
    GUEST
}