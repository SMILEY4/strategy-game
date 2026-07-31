package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.time.Clock
import kotlin.time.Duration.Companion.hours
import kotlin.time.Instant

/**
 * (Authenticated) Session aggregate
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

    /**
     * Revoke the session. No longer valid and can no longer be used to authenticate.
     */
    fun revoke() {
        this.status = Status.REVOKED
    }


    /**
     * @return whether the session is valid and can be used to authenticate (revoked, expired, ...)
     */
    fun isValid(): Boolean {
        if (status != Status.ACTIVE) return false
        if (Clock.System.now() > expiresAt) return false
        return true
    }


    /**
     * @return the token associated with this session
     */
    fun getToken(): SessionToken {
        return token
    }


    /**
     * @return the [UserId] associated with this session
     */
    fun getUserId(): UserId {
        return userId
    }


    /**
     * @return a snapshot of the current state of this aggregate
     */
    fun toSnapshot() = SessionSnapshot(
        token = token,
        userId = userId,
        expiresAt = expiresAt,
        status = status
    )
}