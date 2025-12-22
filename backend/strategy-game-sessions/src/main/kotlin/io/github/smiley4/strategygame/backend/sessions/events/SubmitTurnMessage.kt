package io.github.smiley4.strategygame.backend.sessions.events

import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.common.utils.Json
import io.github.smiley4.strategygame.backend.common.websocket.messages.Message

@JsonTypeName(SubmitTurnMessage.TYPE)
internal class SubmitTurnMessage(payload: SubmitTurnPayload) : Message<SubmitTurnMessage.SubmitTurnPayload>(TYPE, payload) {
    companion object {
        const val TYPE = "submit-turn"
    }

    data class SubmitTurnPayload(
        val commands: List<PlayerCommandMsg>
    )

    override fun encode(): String {
        return Json.asString(this)
    }
}

