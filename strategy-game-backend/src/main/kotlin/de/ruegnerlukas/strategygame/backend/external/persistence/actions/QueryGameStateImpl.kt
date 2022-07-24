package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.alias
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.CityState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.CountryState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.MarkerState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.TileState
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGameState

class QueryGameStateImpl(private val database: Database) : QueryGameState {

	override suspend fun execute(worldId: String): Either<EntityNotFoundError, GameState> {
		return either {
			val countries = fetchCountries(worldId)
			val tiles = fetchTiles(worldId)
			val cities = fetchCities(worldId)
			val markers = fetchMarkers(worldId)
			GameState(
				worldId = worldId,
				countries = countries,
				tiles = tiles,
				cities = cities,
				markers = markers
			)
		}
	}

	private suspend fun fetchCountries(worldId: String): List<CountryState> {
		return database
			.startQuery("gamestate.query#countries") {
				SQL
					.select(CountryTbl.id, CountryTbl.amountMoney, PlayerTbl.id.alias("playerId"))
					.from(CountryTbl, PlayerTbl, GameTbl)
					.where(
						PlayerTbl.countryId.isEqual(CountryTbl.id)
								and PlayerTbl.gameId.isEqual(GameTbl.id)
								and GameTbl.worldId.isEqual(placeholder("worldId"))
					)
			}
			.parameters {
				it["worldId"] = worldId
			}
			.execute()
			.getMultipleOrNone { row ->
				CountryState(
					id = row.getString(CountryTbl.id),
					playerId = row.getString("playerId"),
					amountMoney = row.getFloat(CountryTbl.amountMoney)
				)
			}
	}


	private suspend fun fetchTiles(worldId: String): List<TileState> {
		return database
			.startQuery("gamestate.query#tiles") {
				SQL
					.select(TileTbl.id, TileTbl.q, TileTbl.r, TileTbl.type)
					.from(TileTbl)
					.where(TileTbl.worldId.isEqual(placeholder("worldId")))
			}
			.parameters {
				it["worldId"] = worldId
			}
			.execute()
			.getMultipleOrNone { row ->
				TileState(
					id = row.getString(TileTbl.id),
					q = row.getInt(TileTbl.q),
					r = row.getInt(TileTbl.r),
					type = TileType.valueOf(row.getString(TileTbl.type))
				)
			}
	}

	private suspend fun fetchCities(worldId: String): List<CityState> {
		return database
			.startQuery("gamestate.query#cities") {
				SQL
					.select(CityTbl.id, CityTbl.tileId, TileTbl.q, TileTbl.r)
					.from(CityTbl, TileTbl)
					.where(
						CityTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.worldId.isEqual(placeholder("worldId"))
					)
			}
			.parameters {
				it["worldId"] = worldId
			}
			.execute()
			.getMultipleOrNone { row ->
				CityState(
					id = row.getString(CityTbl.id),
					q = row.getInt(TileTbl.q),
					r = row.getInt(TileTbl.r),
					tileId = row.getString(CityTbl.tileId)
				)
			}
	}

	private suspend fun fetchMarkers(worldId: String): List<MarkerState> {
		return database
			.startQuery("gamestate.query#markers") {
				SQL
					.select(MarkerTbl.id, MarkerTbl.playerId, MarkerTbl.tileId, TileTbl.q, TileTbl.r)
					.from(MarkerTbl, TileTbl)
					.where(
						MarkerTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.worldId.isEqual(placeholder("worldId"))
					)
			}
			.parameters {
				it["worldId"] = worldId
			}
			.execute()
			.getMultipleOrNone { row ->
				MarkerState(
					id = row.getString(CityTbl.id),
					q = row.getInt(TileTbl.q),
					r = row.getInt(TileTbl.r),
					tileId = row.getString(MarkerTbl.tileId),
					playerId = row.getString(MarkerTbl.playerId)
				)
			}
	}

}