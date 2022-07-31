package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import arrow.fx.coroutines.parZip
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.alias
import de.ruegnerlukas.kdbl.builder.allColumns
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
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGameExtended

class QueryGameExtendedImpl(
	private val database: Database,
	private val queryGame: QueryGame,
) : QueryGameExtended {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtendedEntity> {
		return either {
			val game = queryGame.execute(gameId).bind()
			parZip(
				{ fetchPlayers(gameId) },
				{ fetchCountries(gameId) },
				{ fetchTiles(gameId) },
				{ fetchMarkers(gameId) },
				{ fetchCities(gameId) }
			) { players, countries, tiles, markers, cities ->
				GameExtendedEntity(
					turn = game.turn,
					players = players,
					countries = countries,
					tiles = tiles,
					cities = cities,
					markers = markers,
				)
			}
		}
	}


	private suspend fun fetchPlayers(gameId: String): List<PlayerEntity> {
		return database
			.startQuery("gameext.query#players") {
				SQL
					.select(PlayerTbl.allColumns())
					.from(PlayerTbl)
					.where(PlayerTbl.gameId.isEqual(placeholder("gameId")))
			}
			.parameters {
				it["gameId"] = gameId
			}
			.execute()
			.getMultipleOrNone { row ->
				PlayerEntity(
					id = row.getString(PlayerTbl.id),
					userId = row.getString(PlayerTbl.userId),
					gameId = row.getString(PlayerTbl.gameId),
					connectionId = row.getIntOrNull(PlayerTbl.connectionId),
					state = row.getString(PlayerTbl.state),
					countryId = row.getString(PlayerTbl.countryId)
				)
			}
	}

	private suspend fun fetchCountries(gameId: String): List<CountryEntity> {
		return database
			.startQuery("gameext.query#countries") {
				SQL
					.select(CountryTbl.id, CountryTbl.amountMoney, PlayerTbl.id.alias("playerId"))
					.from(CountryTbl, PlayerTbl, GameTbl)
					.where(
						PlayerTbl.countryId.isEqual(CountryTbl.id)
								and PlayerTbl.gameId.isEqual(GameTbl.id)
								and GameTbl.id.isEqual(placeholder("gameId"))
					)
			}
			.parameters {
				it["gameId"] = gameId
			}
			.execute()
			.getMultipleOrNone { row ->
				CountryEntity(
					id = row.getString(CountryTbl.id),
					gameId = gameId,
					amountMoney = row.getFloat(CountryTbl.amountMoney)
				)
			}
	}


	private suspend fun fetchTiles(gameId: String): List<TileEntity> {
		return database
			.startQuery("gameext.query#tiles") {
				SQL
					.select(TileTbl.id, TileTbl.q, TileTbl.r, TileTbl.type)
					.from(TileTbl)
					.where(TileTbl.gameId.isEqual(placeholder("gameId")))
			}
			.parameters {
				it["gameId"] = gameId
			}
			.execute()
			.getMultipleOrNone { row ->
				TileEntity(
					id = row.getString(TileTbl.id),
					gameId = gameId,
					q = row.getInt(TileTbl.q),
					r = row.getInt(TileTbl.r),
					type = row.getString(TileTbl.type)
				)
			}
	}

	private suspend fun fetchCities(gameId: String): List<CityEntity> {
		return database
			.startQuery("gameext.query#cities") {
				SQL
					.select(CityTbl.id, CityTbl.tileId, TileTbl.q, TileTbl.r)
					.from(CityTbl, TileTbl)
					.where(
						CityTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.gameId.isEqual(placeholder("gameId"))
					)
			}
			.parameters {
				it["gameId"] = gameId
			}
			.execute()
			.getMultipleOrNone { row ->
				CityEntity(
					id = row.getString(CityTbl.id),
					tileId = row.getString(CityTbl.tileId)
				)
			}
	}

	private suspend fun fetchMarkers(gameId: String): List<MarkerEntity> {
		return database
			.startQuery("gameext.query#markers") {
				SQL
					.select(MarkerTbl.id, MarkerTbl.playerId, MarkerTbl.tileId, TileTbl.q, TileTbl.r)
					.from(MarkerTbl, TileTbl)
					.where(
						MarkerTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.gameId.isEqual(placeholder("gameId"))
					)
			}
			.parameters {
				it["gameId"] = gameId
			}
			.execute()
			.getMultipleOrNone { row ->
				MarkerEntity(
					id = row.getString(CityTbl.id),
					tileId = row.getString(MarkerTbl.tileId),
					playerId = row.getString(MarkerTbl.playerId)
				)
			}
	}


}