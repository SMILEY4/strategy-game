package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.api.message.models.WorldStateMessage.Companion.WorldStatePayload
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity


@JsonTypeName(WorldStateMessage.TYPE)
class WorldStateMessage(payload: WorldStatePayload) : Message<WorldStatePayload>(TYPE, payload) {
	companion object {

		const val TYPE = "world-state"

		data class WorldStatePayload(
			val world: WorldExtendedEntity
		)

	}
}

