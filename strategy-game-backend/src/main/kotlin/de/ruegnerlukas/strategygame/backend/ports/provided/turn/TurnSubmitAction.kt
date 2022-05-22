package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.ports.models.messages.CommandAddMarker
import de.ruegnerlukas.strategygame.backend.ports.models.new.CommandAddMarkerEntity
import de.ruegnerlukas.strategygame.backend.shared.Rail

interface TurnSubmitAction {

	suspend fun perform(userId: String, gameId: String, commands: List<CommandAddMarker>): Rail<Unit>

}