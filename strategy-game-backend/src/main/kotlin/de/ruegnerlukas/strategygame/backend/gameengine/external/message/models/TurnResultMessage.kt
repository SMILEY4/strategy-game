package de.ruegnerlukas.strategygame.backend.gameengine.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.models.dtos.CommandResolutionErrorDTO
import de.ruegnerlukas.strategygame.backend.common.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.models.TurnResultMessage.Companion.TurnResultPayload


@JsonTypeName(TurnResultMessage.TYPE)
class TurnResultMessage(payload: TurnResultPayload) : Message<TurnResultPayload>(TYPE, payload) {
	companion object {

		const val TYPE = "turn-result"

		data class TurnResultPayload(
			val game: GameExtendedDTO,
			val errors: List<CommandResolutionErrorDTO>
		)

	}
}

