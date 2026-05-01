package io.github.smiley4.strategygame.shared.domain

import kotlin.uuid.Uuid

/**
 * Id of a game.
 */
@JvmInline
value class GameId(val id: Uuid = Uuid.random()) {

    constructor(id: String) : this(
        try {
            Uuid.parse(id)
        } catch (e: Exception) {
            throw InvalidFormatException(e)
        }
    )

    class InvalidFormatException(cause: Throwable?) : Exception("Uuid has invalid format", cause)

}
