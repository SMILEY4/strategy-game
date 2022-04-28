package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.Tilemap
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.failure

data class WorldParticipant(
	val connectionId: Int,
	val playerName: String,
	var turnState: String // "playing", or "ended-turn"
)

class RepositoryImpl : Repository {

	private val maps: MutableMap<String, Tilemap> = mutableMapOf()
	private val participants: MutableMap<String, MutableList<WorldParticipant>> = mutableMapOf()
	private val submittedCommands: MutableMap<String, MutableList<Pair<Int, List<PlaceMarkerCommand>>>> = mutableMapOf()


	override fun saveTilemap(map: Tilemap, id: String) {
		maps[id] = map
	}


	override fun getTilemap(id: String): Result<Tilemap> {
		return if (maps.containsKey(id)) {
			Result.success(maps[id]!!)
		} else {
			Result.failure("No map with id $id found")
		}
	}

	override fun getParticipantConnections(worldId: String): Result<List<Int>> {
		if (participants.containsKey(worldId)) {
			return Result.success(participants[worldId]?.map { it.connectionId }!!)
		} else {
			return Result.failure("No world with id $worldId")
		}
	}


	override fun addParticipant(worldId: String, connectionId: Int, name: String) {
		if (!participants.containsKey(worldId)) {
			participants[worldId] = mutableListOf()
		}
		participants[worldId]?.add(WorldParticipant(connectionId, name, "playing"))
	}


	override fun removeParticipant(connectionId: Int) {
		participants.values.forEach { list ->
			list.removeIf { it.connectionId == connectionId }
		}
	}


	override fun endPlayerTurn(worldId: String, connectionId: Int, commands: List<PlaceMarkerCommand>) {
		if (participants.containsKey(worldId)) {
			participants[worldId]?.forEach {
				if (it.connectionId == connectionId) {
					it.turnState = "ended-turn"
				}
			}
			if (!submittedCommands.containsKey(worldId)) {
				submittedCommands[worldId] = mutableListOf()
			}
			submittedCommands[worldId]!!.add(connectionId to commands)
		}
	}

	override fun setAllParticipantsPlaying(worldId: String) {
		if (participants.containsKey(worldId)) {
			participants[worldId]?.forEach {
				it.turnState = "playing"
			}
		}
	}


	override fun countPlayingParticipants(worldId: String): Result<Int> {
		if (participants.containsKey(worldId)) {
			var count = 0;
			participants[worldId]?.forEach {
				if (it.turnState == "playing") {
					count++;
				}
			}
			return Result.success(count);
		} else {
			return Result.failure("No world with id $worldId")
		}
	}

	override fun getWorldsByParticipant(connectionId: Int): List<String> {
		val worldIds = mutableListOf<String>()
		participants.entries.forEach { entry ->
			if (entry.value.find { it.connectionId == connectionId } != null) {
				worldIds.add(entry.key)
			}
		}
		return worldIds
	}

	override fun getCommands(worldId: String): Map<Int, List<PlaceMarkerCommand>> {
		if (submittedCommands.containsKey(worldId)) {
			val commands: List<Pair<Int, List<PlaceMarkerCommand>>> = submittedCommands[worldId]!!
			val map = mutableMapOf<Int, List<PlaceMarkerCommand>>()
			commands.forEach { map[it.first] = it.second }
			return map
		} else {
			return mapOf()
		}
	}


}