package io.github.smiley4.strategygame.backend.sessions.events

import com.fasterxml.jackson.annotation.JsonTypeName
import com.lectra.koson.obj
import com.lectra.koson.rawJson
import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.websocket.messages.Message


@JsonTypeName(TurnResultMessage.TYPE)
internal class TurnResultMessage(payload: TurnResultPayload) : Message<TurnResultMessage.Companion.TurnResultPayload>(TYPE, payload) {
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

