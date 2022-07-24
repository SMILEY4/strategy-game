package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.CityState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.CountryState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.TileState
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID
import kotlin.math.sqrt

class ResolveCreateCityCommandImpl : ResolveCreateCityCommand {

	companion object {
		const val MIN_DIST_BETWEEN_CITIES = 4.0f
		const val CITY_COST = 50.0f
	}

	override suspend fun perform(
		command: CommandEntity,
		state: GameState
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		val data: CreateCityCommandData = Json.fromString(Base64.fromBase64(command.data))
		return either {

			val country = findCountry(command, state).bind()
			val tile = findTile(data, state).bind()

			val validationErrors = mutableListOf<String>().apply {
				addAll(validateTileType(tile))
				addAll(validateCitySpacing(state.cities.get(), tile))
				addAll(validateResourceCost(country))
			}

			if (validationErrors.isEmpty()) {
				val city = CityState(
					id = UUID.gen(),
					tileId = tile.id,
					q = tile.q,
					r = tile.r,
				)
				state.cities.get().add(city)
				country.amountMoney.set(country.amountMoney.get() - CITY_COST)
				emptyList()
			} else {
				validationErrors.map { CommandResolutionError(command, it) }
			}
		}
	}


	private fun findTile(data: CreateCityCommandData, state: GameState): Either<ResolveCommandsActionError, TileState> {
		val targetTile = state.tiles.find { it.q == data.q && it.r == data.r }
		if (targetTile == null) {
			return ResolveCommandsAction.TileNotFoundError.left()
		} else {
			return targetTile.right()
		}
	}


	private fun findCountry(command: CommandEntity, state: GameState): Either<ResolveCommandsActionError, CountryState> {
		val country = state.countries.find { it.playerId == command.playerId }
		if (country == null) {
			return ResolveCommandsAction.CountryNotFoundError.left()
		} else {
			return country.right()
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateTileType(tile: TileState): List<String> {
		if (tile.type == TileType.LAND) {
			return emptyList()
		} else {
			return listOf("invalid tile type")
		}
	}


	/**
	 * @returns a list of validation errors
	 */
	private fun validateCitySpacing(cities: List<CityState>, target: TileState): List<String> {
		val closestCity = cities
			.map { city ->
				val dq = target.q - city.q
				val dr = target.r - city.r
				val dist = sqrt((dq * dq + dr * dr).toDouble())
				city to dist
			}
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
	private fun validateResourceCost(country: CountryState): List<String> {
		if (country.amountMoney.get() < CITY_COST) {
			return listOf("not enough money")
		} else {
			return emptyList()
		}
	}

}