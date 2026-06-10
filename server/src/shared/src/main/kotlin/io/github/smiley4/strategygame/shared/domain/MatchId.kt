package io.github.smiley4.strategygame.shared.domain

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

@JvmInline
@Serializable
value class MatchId(val value: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw MatchIdError.InvalidFormat(id, e)
        }
    )

}

sealed class MatchIdError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidFormat(value: String, cause: Throwable?) : MatchIdError("$value has invalid format.", cause)
}