package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.changes.DataChange
import de.ruegnerlukas.strategygame.backend.ports.models.changes.InsertCityChange
import de.ruegnerlukas.strategygame.backend.ports.models.changes.ModifyMoneyChange
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionResult
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID

class ResolveCreateCityCommandImpl() : ResolveCreateCityCommand {

	companion object {
		const val MIN_DIST_BETWEEN_CITIES = 4.0f
		const val CITY_COST = 50.0f
	}

	override suspend fun perform(
		command: CommandEntity,
		world: WorldExtendedEntity
	): Either<ResolveCommandsActionError, CommandResolutionResult> {
		val data: CreateCityCommandData = Json.fromString(Base64.fromBase64(command.data))
		return either {
			val player = findPlayer(command, world).bind()
			val country = findCountry(player, world).bind()
			val tile = findTile(data, world).bind()

			// TODO: implement validation
			validateTileType(tile)
			validateCitySpacing(world.cities)
			validateResourceCost(country)

			result(
				InsertCityChange(
					CityEntity(
						id = UUID.gen(),
						tileId = tile.id,
					)
				),
				ModifyMoneyChange(
					countryId = country.id,
					change = -CITY_COST
				)
			)
		}
	}


	private fun findPlayer(command: CommandEntity, world: WorldExtendedEntity): Either<ResolveCommandsActionError, PlayerEntity> {
		val player = world.players.find { it.id == command.playerId }
		if (player == null) {
			return ResolveCommandsAction.PlayerNotFoundError.left()
		} else {
			return player.right()
		}
	}


	private fun findTile(data: CreateCityCommandData, world: WorldExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
		val targetTile = world.tiles.find { it.q == data.q && it.r == data.r }
		if (targetTile == null) {
			return ResolveCommandsAction.TileNotFoundError.left()
		} else {
			return targetTile.right()
		}
	}

	private fun findCountry(player: PlayerEntity, world: WorldExtendedEntity): Either<ResolveCommandsActionError, CountryEntity> {
		val country = world.countries.find { it.id == player.countryId }
		if (country == null) {
			return ResolveCommandsAction.CountryNotFoundError.left()
		} else {
			return country.right()
		}
	}


	private fun validateTileType(tile: TileEntity) {
		// check if tile is of valid type
		/*
		* if (targetTile.type != TileType.LAND.name) { ... }
		* */
	}


	private fun validateCitySpacing(cities: List<CityEntity>) {
		// check if new city is far enough away from existing cities
		/*
		* val nearestCity = world.cities
		* 	.map { city ->
		* 		val dq = 0
		* 		val dr = 0
		* 		val dist = sqrt((dq * dq + dr * dr).toDouble())
		* 		city to dist
		* 	}
		* 	.minByOrNull { it.second }
		* if (nearestCity != null && nearestCity.second < MIN_DIST_BETWEEN_CITIES) {
		* 	return CommandResolutionResult.EMPTY
		* }
		* */
	}


	private fun validateResourceCost(country: CountryEntity) {
		// check if country has enough initial resources
		/*
		* if (country.amountMoney < CITY_COST) { ... }
		* */
	}


	/**
	 * @return a [CommandResolutionResult] with the given changes
	 */
	private fun result(vararg changes: DataChange): CommandResolutionResult {
		return CommandResolutionResult(
			changes = changes.toList(),
			errors = emptyMap()
		)
	}

}