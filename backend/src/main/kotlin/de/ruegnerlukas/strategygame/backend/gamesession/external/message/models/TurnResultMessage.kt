package de.ruegnerlukas.strategygame.backend.gamesession.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.TurnResultMessage.Companion.TurnResultPayload


@JsonTypeName(TurnResultMessage.TYPE)
class TurnResultMessage(payload: TurnResultPayload) : Message<TurnResultPayload>(TYPE, payload) {
	companion object {

		const val TYPE = "turn-result"

		data class TurnResultPayload(
			val game: GameExtendedDTO,
			val errors: List<*> // TODO: remove ?
		)

	}
}
