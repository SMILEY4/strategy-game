package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.city.CityInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID

class CommandResolver(
	private val insertMarkers: MarkerInsertMultiple,
	private val insertCity: CityInsert,
) {

	suspend fun resolve(commands: List<CommandEntity>) {
		commands.forEach { resolveCommand(it) }
	}

	private suspend fun resolveCommand(command: CommandEntity) {
		when (command.type) {
			PlaceMarkerCommand.TYPE -> {
				val marker = mapCommandToMarker(command)
				insertMarkers.execute(listOf(marker))
			}
			CreateCityCommand.TYPE -> {
				val city = mapCommandToCity(command)
				insertCity.execute(city)
			}
		}
	}

	private fun mapCommandToMarker(command: CommandEntity): MarkerEntity {
		val data: CommandEntity.Companion.PlaceMarkerCommandData = Json.fromString(Base64.fromBase64(command.data))
		return MarkerEntity(
			id = UUID.gen(),
			playerId = command.playerId,
			tileId = data.tileId
		)
	}

	private fun mapCommandToCity(command: CommandEntity): CityEntity {
		val data: CommandEntity.Companion.CreateCityCommandData = Json.fromString(Base64.fromBase64(command.data))
		return CityEntity(
			id = UUID.gen(),
			tileId = data.tileId,
			countryId = "TODO"
		)
	}


}