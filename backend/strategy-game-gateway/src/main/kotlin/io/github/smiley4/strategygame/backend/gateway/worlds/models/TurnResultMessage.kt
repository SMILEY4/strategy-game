package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonTypeName
import com.lectra.koson.obj
import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType


@JsonTypeName(TurnResultMessage.TYPE)
class TurnResultMessage(payload: TurnResultPayload) : Message<TurnResultMessage.Companion.TurnResultPayload>(TYPE, payload) {
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

