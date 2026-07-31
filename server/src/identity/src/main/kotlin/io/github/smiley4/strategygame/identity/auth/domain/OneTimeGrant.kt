package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.time.Clock
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Instant

internal class OneTimeGrant private constructor(
    private val token: OneTimeToken,
    private val userId: UserId,
    private val expiresAt: Instant,
    private var status: Status,
) {

    enum class Status { ACTIVE, REVOKED, CONSUMED }

    constructor(userId: UserId) : this(
        token = OneTimeToken(),
        userId = userId,
        expiresAt = Clock.System.now().plus(1.minutes),
        status = Status.ACTIVE
    )

    constructor(snapshot: OneTimeGrantSnapshot) : this(
        token = snapshot.token,
        userId = snapshot.userId,
        expiresAt = snapshot.expiresAt,
        status = snapshot.status
    )


    /**
     * Checks whether this token is valid and consumes it.
     * @return whether this token is valid
     */
    fun consume(): Boolean {
        if (status != Status.ACTIVE) return false
        if (Clock.System.now() > expiresAt) return false
        this.status = Status.CONSUMED
        return true
    }

    /**
     * @return the [UserId] associated with this grant
     */
    fun getUserId(): UserId {
        return userId
    }

    /**
     * @return the token associated with this grant
     */
    fun getToken(): OneTimeToken {
        return token
    }

    /**
     * @return a snapshot of the current state of this aggregate
     */
    fun toSnapshot() = OneTimeGrantSnapshot(
        token = token,
        userId = userId,
        expiresAt = expiresAt,
        status = status
    )


}