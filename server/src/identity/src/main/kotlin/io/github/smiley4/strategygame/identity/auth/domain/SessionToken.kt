package io.github.smiley4.strategygame.identity.auth.domain

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

/**
 * Session token to authenticate a user
 */
@JvmInline
@Serializable
value class SessionToken(val value: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw SessionTokenError.InvalidFormat(e)
        }
    )

}

sealed class SessionTokenError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidFormat(cause: Throwable?) : SessionTokenError("Token has invalid format.", cause)
}