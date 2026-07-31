package io.github.smiley4.strategygame.shared.values

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

@JvmInline
@Serializable
value class GameId(val id: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw GameIdError.InvalidFormat(id, e)
        }
    )

}

sealed class GameIdError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidFormat(value: String, cause: Throwable?) : GameIdError("$value has invalid format.", cause)
}