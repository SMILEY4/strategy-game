package de.ruegnerlukas.strategygame.backend.core.turnresolver

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json

class ResolveTurnService(
	private val gameStateProvider: GameStateProvider
) {

	fun resolveCommands(commands: List<CommandEntity>) {
		val gameState = gameStateProvider.getCurrentGameState()
		commands.forEach { command ->
			when (command.type) {
				PlaceMarkerCommand.TYPE -> resolvePlaceMarkerCommand(gameState, command)
				CreateCityCommand.TYPE -> resolveCreateCityCommand(gameState, command)
			}
		}
	}


	private fun resolvePlaceMarkerCommand(gameState: TurnGameState, command: CommandEntity) {
		val data: PlaceMarkerCommandData = Json.fromString(Base64.fromBase64(command.data))
		gameState.tiles.find { it.q == data.q && it.r == data.r }?.let { tile ->
			tile.addMarker(MarkerState.create(command.playerId, tile.q, tile.r))
		}
	}


	private fun resolveCreateCityCommand(gameState: TurnGameState, command: CommandEntity) {
		val data: CreateCityCommandData = Json.fromString(Base64.fromBase64(command.data))
		val tileIsValidType = TODO()
		val tileIsEmpty = TODO()
		val noNearbyCity = TODO()
		if (tileIsValidType && tileIsEmpty && noNearbyCity) {
			gameState.tiles.find { it.q == data.q && it.r == data.r }?.let { tile ->
				tile.addCity(CityState.create(tile.q, tile.r))
			}
		}
	}


}