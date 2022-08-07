package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrHandle
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCountryByGameAndUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContentEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

object TestUtils {

	suspend fun getPlayer(database: ArangoDatabase, userId: String, gameId: String): PlayerEntity {
		return getPlayers(database, gameId).first { it.userId == userId }
	}

	suspend fun getCountry(database: ArangoDatabase, gameId: String, userId: String): CountryEntity {
		return QueryCountryByGameAndUserImpl(database).execute(gameId, userId)
			.getOrHandle { throw Exception("country with gameId=$gameId and userId=$userId not found") }
	}

	suspend fun getGame(database: ArangoDatabase, gameId: String): GameEntity {
		return QueryGameImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getCommands(database: ArangoDatabase, gameId: String, turn: Int): List<CommandEntity<*>> {
		return QueryCommandsByGameImpl(database).execute(gameId, turn)
	}

	suspend fun getPlayers(database: ArangoDatabase, gameId: String): List<PlayerEntity> {
		return QueryGameImpl(database).execute(gameId)
			.getOrHandle { throw Exception("Game $gameId not found") }
			.players
	}

	suspend fun getMarkersAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<Pair<TileEntity, MarkerTileContentEntity>> {
		return getMarkers(database, gameId)
			.filter { it.first.position.q == q && it.first.position.r == r }
	}

	suspend fun getMarkers(database: ArangoDatabase, gameId: String): List<Pair<TileEntity, MarkerTileContentEntity>> {
		return getTiles(database, gameId)
			.filter { it.content.isNotEmpty() }
			.flatMap { tile -> tile.content.map { tile to it } }
			.filter { it.second is MarkerTileContentEntity }
			.map { it.first to (it.second as MarkerTileContentEntity) }
	}

	suspend fun getCitiesAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<CityEntity> {
		val tile = getTiles(database, gameId).first { it.position.q == q && it.position.r == r }
		return getCities(database, gameId).filter { it.tileId == tile.id }
	}

	suspend fun getCities(database: ArangoDatabase, gameId: String): List<CityEntity> {
		return database.query(
			"""
				FOR city IN ${Collections.CITIES}
					FILTER city.gameId == @gameId
					RETURN city
			""".trimIndent(),
			mapOf("gameId" to gameId),
			CityEntity::class.java
		)?.toList() ?: emptyList()
	}

	suspend fun getTiles(database: ArangoDatabase, gameId: String): List<TileEntity> {
		return database.query(
			"""
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
			mapOf("gameId" to gameId),
			TileEntity::class.java
		)?.toList() ?: emptyList()
	}


}