package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.api.message.models.TurnResultMessage.Companion.TurnResultPayload
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CommandResolutionErrorDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO


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

