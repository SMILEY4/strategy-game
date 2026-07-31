package io.github.smiley4.strategygame.identity.auth.domain

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

/**
 * One-Time token to authenticate a single user action
 */
@JvmInline
@Serializable
value class OneTimeToken(val value: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw OneTimeTokenError.InvalidFormat(e)
        }
    )

}

sealed class OneTimeTokenError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidFormat(cause: Throwable?) : OneTimeTokenError("Token has invalid format.", cause)
}