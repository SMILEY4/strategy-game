package io.github.smiley4.strategygame.backend.sessions.events

import com.fasterxml.jackson.annotation.JsonTypeName
import com.lectra.koson.obj
import com.lectra.koson.rawJson
import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.websocket.messages.Message


@JsonTypeName(GameStateMessage.TYPE)
internal class GameStateMessage(payload: GameStatePayload) : Message<GameStateMessage.Companion.GameStatePayload>(TYPE, payload) {
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

