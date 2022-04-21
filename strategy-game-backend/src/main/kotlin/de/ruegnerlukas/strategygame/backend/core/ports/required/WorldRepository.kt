package de.ruegnerlukas.strategygame.backend.core.ports.required

import de.ruegnerlukas.strategygame.backend.core.ports.models.Tilemap
import de.ruegnerlukas.strategygame.backend.external.api.models.NewTurnData
import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand

/**
 * Saves data related to worlds
 */
interface WorldRepository {

	/**
	 * Save the tilemap with the given id
	 */
	fun saveTilemap(map: Tilemap, id: String)


	/**
	 * Retrieve a tilemap with the given id
	 */
	fun getTilemap(id: String): Result<Tilemap>


	/**
	 * Get all connection ids of the players participating in a given world
	 */
	fun getParticipantConnections(worldId: String): Result<List<Int>>


	/**
	 * Adds the given player as an active player to the given world
	 */
	fun addParticipant(worldId: String, connectionId: Int, name: String)


	/**
	 * Removes the given player as an active player from any world
	 */
	fun removeParticipant(connectionId: Int)


	/**
	 * remember the given player has ended the current turn
	 */
	fun endPlayerTurn(worldId: String, connectionId: Int, commands: List<PlaceMarkerCommand>)


	/**
	 * Set the state of all participants of the given world to "playing"
	 */
	fun setAllParticipantsPlaying(worldId: String)


	/**
	 * count the amount of participants of the given world that have not ended the current turn
	 */
	fun countPlayingParticipants(worldId: String): Result<Int>


	/**
	 * Get the ids of the world the given player is participating
	 */
	fun getWorldsByParticipant(connectionId: Int): List<String>


	/**
	 * get all commands of all players of the given world
	 */
	fun getCommands(worldId: String): Map<Int, List<PlaceMarkerCommand>>

}