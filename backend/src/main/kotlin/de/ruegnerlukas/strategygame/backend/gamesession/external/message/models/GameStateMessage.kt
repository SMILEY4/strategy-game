package de.ruegnerlukas.strategygame.backend.gamesession.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import com.lectra.koson.obj
import com.lectra.koson.rawJson
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage.Companion.GameStatePayload


@JsonTypeName(GameStateMessage.TYPE)
class GameStateMessage(payload: GameStatePayload) : Message<GameStatePayload>(TYPE, payload) {
    companion object {

        const val TYPE = "game-state"

        data class GameStatePayload(
            val game: JsonType
        )

    }

    override fun encode(): String {
        return obj {
            "type" to TYPE
            "payload" to rawJson(payload.game.toPrettyJsonString())
        }.pretty(3)
    }
}

