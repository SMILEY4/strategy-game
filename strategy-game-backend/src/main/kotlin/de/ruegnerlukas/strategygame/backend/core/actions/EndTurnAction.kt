package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.required.GenericMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.external.api.models.NewTurnMessage
import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.external.api.models.PlayerMarker
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class EndTurnAction(
	private val messageProducer: GenericMessageProducer,
	private val repository: Repository
) {

	suspend fun perform(worldId: String) {
		repository.setAllParticipantsPlaying(worldId)
		val commands = repository.getCommands(worldId)
		val newTurnData = buildNewTurnData(commands)
		repository.getParticipantConnections(worldId).getOrThrow().forEach {
			messageProducer.sendToSingle(it, "new-turn", Json.encodeToString(newTurnData))
		}
	}

	private fun buildNewTurnData(commands: Map<Int, List<PlaceMarkerCommand>>): NewTurnMessage {
		val addedMarkers = mutableListOf<PlayerMarker>()
		commands.forEach { entry ->
			entry.value.forEach { cmd ->
				addedMarkers.add(PlayerMarker(cmd.q, cmd.r, entry.key))
			}
		}
		return NewTurnMessage(addedMarkers)
	}

}