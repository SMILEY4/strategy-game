package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityTileContentEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
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
				addAll(validateTileType(targetTile))
				addAll(validateCitySpacing(state.tiles, targetTile))
				addAll(validateResourceCost(country))
			}

			if (validationErrors.isEmpty()) {
				targetTile.content.add(CityTileContentEntity())
				state.cities.add(
					CityEntity(
						tileId = targetTile.key!!,
						gameId = targetTile.gameId
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
	private fun validateCitySpacing(tiles: List<TileEntity>, target: TileEntity): List<String> {
		val closestCity = tiles
			.flatMap { tile -> tile.content.filter { it.type == CityTileContentEntity.TYPE }.map { tile to it } }
			.map { tileToCity ->
				val tile = tileToCity.first
				val city = tileToCity.second
				val dq = target.position.q - tile.position.q
				val dr = target.position.r - tile.position.r
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
	private fun validateResourceCost(country: CountryEntity): List<String> {
		if (country.resources.money < CITY_COST) {
			return listOf("not enough money")
		} else {
			return emptyList()
		}
	}

}