package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrHandle
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayerImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OldPlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

object TestUtils {

	suspend fun getPlayer(database: Database, userId: String, gameId: String): OldPlayerEntity {
		return QueryPlayerImpl(database).execute(userId, gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getGame(database: Database, gameId: String): GameEntity {
		return QueryGameImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getCommands(database: Database, gameId: String, turn: Int): List<CommandEntity> {
		return QueryCommandsByGameImpl(database).execute(gameId, turn)
	}

	suspend fun getPlayers(database: Database, gameId: String): List<OldPlayerEntity> {
		return database
			.startQuery {
				SQL
					.select(PlayerTbl.allColumns())
					.from(PlayerTbl)
					.where(PlayerTbl.gameId.isEqual(gameId))
			}
			.execute()
			.getMultipleOrNone { row ->
				OldPlayerEntity(
					id = row.getString(PlayerTbl.id),
					userId = row.getString(PlayerTbl.userId),
					gameId = row.getString(PlayerTbl.gameId),
					connectionId = row.getIntOrNull(PlayerTbl.connectionId),
					state = row.getString(PlayerTbl.state),
					countryId = row.getString(PlayerTbl.countryId)
				)
			}
	}

	suspend fun getMarkersAt(database: Database, gameId: String, q: Int, r: Int): List<MarkerEntity> {
		val tile = getTiles(database, gameId).first { it.q == q && it.r == r }
		return getMarkers(database, gameId).filter { it.tileId == tile.id }
	}

	suspend fun getMarkers(database: Database, gameId: String): List<MarkerEntity> {
		return database
			.startQuery {
				SQL
					.select(MarkerTbl.allColumns())
					.from(MarkerTbl, TileTbl)
					.where(
						MarkerTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.gameId.isEqual(gameId)
					)
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

	suspend fun getCitiesAt(database: Database, gameId: String, q: Int, r: Int): List<CityEntity> {
		val tile = getTiles(database, gameId).first { it.q == q && it.r == r }
		return getCities(database, gameId).filter { it.tileId == tile.id }
	}

	suspend fun getCities(database: Database, gameId: String): List<CityEntity> {
		return database
			.startQuery {
				SQL
					.select(CityTbl.allColumns())
					.from(CityTbl, TileTbl)
					.where(
						CityTbl.tileId.isEqual(TileTbl.id)
								and TileTbl.gameId.isEqual(gameId)
					)
			}
			.execute()
			.getMultipleOrNone { row ->
				CityEntity(
					id = row.getString(CityTbl.id),
					tileId = row.getString(CityTbl.tileId)
				)
			}
	}

	suspend fun getTiles(database: Database, gameId: String): List<TileEntity> {
		return database
			.startQuery {
				SQL
					.select(TileTbl.id, TileTbl.q, TileTbl.r, TileTbl.type)
					.from(TileTbl)
					.where(TileTbl.gameId.isEqual(gameId))
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


}