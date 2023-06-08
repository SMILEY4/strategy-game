package de.ruegnerlukas.strategygame.backend.gamesession.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.SubmitTurnMessage.Companion.SubmitTurnPayload

@JsonTypeName(SubmitTurnMessage.TYPE)
class SubmitTurnMessage(payload: SubmitTurnPayload) : Message<SubmitTurnPayload>(TYPE, payload) {
    companion object {

        const val TYPE = "submit-turn"

        data class SubmitTurnPayload(
            val commands: List<PlayerCommandMsg>
        )

    }
}

