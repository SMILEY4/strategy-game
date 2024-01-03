package de.ruegnerlukas.strategygame.backend.gamesession.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.TurnResultMessage.Companion.TurnResultPayload


@JsonTypeName(TurnResultMessage.TYPE)
class TurnResultMessage(payload: TurnResultPayload) : Message<TurnResultPayload>(TYPE, payload) {
	companion object {

		const val TYPE = "turn-result"

		data class TurnResultPayload(
			val game: JsonType,
			val errors: List<*> // TODO: remove ?
		)

	}

	override fun encode(): String {
		return obj {
			"type" to TYPE
			"payload" to payload.game
		}.pretty(3)
	}
}

