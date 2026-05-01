package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.shared.domain.UserId
import kotlin.time.Clock
import kotlin.time.Duration.Companion.hours
import kotlin.time.Instant

/**
 * Session aggregate
 */
internal class Session private constructor(
    private val token: SessionToken,
    private val userId: UserId,
    private val expiresAt: Instant,
    private var status: Status,
) {

    enum class Status { ACTIVE, REVOKED }

    constructor(userId: UserId) : this(
        token = SessionToken(),
        userId = userId,
        expiresAt = Clock.System.now().plus(24.hours),
        status = Status.ACTIVE
    )

    constructor(snapshot: SessionSnapshot) : this(
        token = snapshot.token,
        userId = snapshot.userId,
        expiresAt = snapshot.expiresAt,
        status = snapshot.status
    )

    fun revoke() {
        this.status = Status.REVOKED
    }

    fun isValid(): Boolean {
        if (status == Status.REVOKED) return false
        if (Clock.System.now() > expiresAt) return false
        return true
    }

    fun getToken(): SessionToken {
        return token
    }

    fun getUserId(): UserId {
        return userId
    }

    fun toSnapshot() = SessionSnapshot(
        token = token,
        userId = userId,
        expiresAt = expiresAt,
        status = status
    )
}