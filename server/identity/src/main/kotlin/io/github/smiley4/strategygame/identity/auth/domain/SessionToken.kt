package io.github.smiley4.strategygame.identity.auth.domain

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

@JvmInline
@Serializable
value class SessionToken(val value: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw InvalidFormatException(e)
        }
    )

    class InvalidFormatException(cause: Throwable?) : Exception("Uuid has invalid format", cause)

}
