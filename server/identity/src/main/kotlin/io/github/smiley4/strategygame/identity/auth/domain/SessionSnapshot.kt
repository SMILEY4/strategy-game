package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId
import kotlin.time.Instant

internal data class SessionSnapshot(
    val token: SessionToken,
    val userId: UserId,
    val expiresAt: Instant,
    val status: Session.Status
)