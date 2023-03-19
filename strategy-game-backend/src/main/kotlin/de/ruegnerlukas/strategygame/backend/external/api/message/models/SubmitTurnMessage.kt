package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.api.message.models.SubmitTurnMessage.Companion.SubmitTurnPayload
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand

@JsonTypeName(SubmitTurnMessage.TYPE)
class SubmitTurnMessage(payload: SubmitTurnPayload) : Message<SubmitTurnPayload>(TYPE, payload) {
	companion object {

		const val TYPE = "submit-turn"

		data class SubmitTurnPayload(
			val commands: List<PlayerCommand>
		)

	}
}

