package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.common.utils.Json

@JsonTypeName(SubmitTurnMessage.TYPE)
class SubmitTurnMessage(payload: SubmitTurnPayload) : Message<SubmitTurnMessage.Companion.SubmitTurnPayload>(TYPE, payload) {
    companion object {

        const val TYPE = "submit-turn"

        data class SubmitTurnPayload(
            val commands: List<PlayerCommandMsg>
        )

    }

    override fun encode(): String {
        return Json.asString(this)
    }
}

