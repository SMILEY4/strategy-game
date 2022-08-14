package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.distance
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import kotlin.math.sqrt

class ResolveCreateCityCommandImpl : ResolveCreateCityCommand {

	companion object {
		const val MIN_DIST_BETWEEN_CITIES = 4.0f
		const val CITY_COST = 50.0f
	}

	override suspend fun perform(
		command: CommandEntity<CreateCityCommandDataEntity>,
		state: GameExtendedEntity
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		return either {

			val country = findCountry(command.countryId, state).bind()
			val targetTile = findTile(command.data.q, command.data.r, state).bind()

			val validationErrors = mutableListOf<String>().apply {
				addAll(validateCityName(command.data.name))
				addAll(validateTileType(targetTile))
				addAll(validateCitySpacing(state.cities, targetTile))
				addAll(validateResourceCost(country))
			}

			if (validationErrors.isEmpty()) {
				state.cities.add(
					CityEntity(
						gameId = targetTile.gameId,
						countryId = country.key!!,
						tile = TileRef(targetTile.key!!, targetTile.position.q, targetTile.position.r),
						name = command.data.name
					)
				)
				country.resources.money -= CITY_COST
				emptyList()
			} else {
				validationErrors.map { CommandResolutionError(command, it) }
			}
		}
	}


	private fun findCountry(countryId: String, state: GameExtendedEntity): Either<ResolveCommandsActionError, CountryEntity> {
		val country = state.countries.find { it.key == countryId }
		if (country == null) {
			return ResolveCommandsAction.CountryNotFoundError.left()
		} else {
			return country.right()
		}
	}


	private fun findTile(q: Int, r: Int, state: GameExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
		val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
		if (targetTile == null) {
			return ResolveCommandsAction.TileNotFoundError.left()
		} else {
			return targetTile.right()
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateCityName(name: String): List<String> {
		if (name.isNotBlank()) {
			return emptyList()
		} else {
			return listOf("invalid city name")
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateTileType(tile: TileEntity): List<String> {
		if (tile.data.terrainType == TileType.LAND.name) {
			return emptyList()
		} else {
			return listOf("invalid tile type")
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateCitySpacing(cities: List<CityEntity>, target: TileEntity): List<String> {
		val closestCity = cities
			.map { city -> city to city.tile.distance(target.position) }
			.minByOrNull { it.second }
		if (closestCity != null && closestCity.second < MIN_DIST_BETWEEN_CITIES) {
			return listOf("too close to another city")
		} else {
			return emptyList()
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateResourceCost(country: CountryEntity): List<String> {
		if (country.resources.money < CITY_COST) {
			return listOf("not enough money")
		} else {
			return emptyList()
		}
	}

}