package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.time.Instant

/**
 * Immutable snapshot of a [OneTimeGrant]
 */
internal data class OneTimeGrantSnapshot(
    val token: OneTimeToken,
    val userId: UserId,
    val expiresAt: Instant,
    val status: OneTimeGrant.Status
)