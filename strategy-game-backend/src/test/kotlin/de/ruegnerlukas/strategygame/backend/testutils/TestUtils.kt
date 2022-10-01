package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrHandle
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

object TestUtils {

	suspend fun getPlayer(database: ArangoDatabase, userId: String, gameId: String): PlayerEntity {
		return getPlayers(database, gameId).first { it.userId == userId }
	}

	suspend fun getCountry(database: ArangoDatabase, countryId: String): CountryEntity {
		return database.getDocument(Collections.COUNTRIES, countryId, CountryEntity::class.java)
			.getOrHandle { throw Exception("country with id=$countryId not found") }
	}

	suspend fun getCountry(database: ArangoDatabase, gameId: String, userId: String): CountryEntity {
		return CountryByGameAndUserQueryImpl(database).execute(gameId, userId)
			.getOrHandle { throw Exception("country with gameId=$gameId and userId=$userId not found") }
	}

	suspend fun updateCountry(database: ArangoDatabase, country: CountryEntity) {
		database.replaceDocument(Collections.COUNTRIES, country.key!!, country)
	}

	suspend fun getGame(database: ArangoDatabase, gameId: String): GameEntity {
		return GameQueryImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getGameExtended(database: ArangoDatabase, gameId: String): GameExtendedEntity {
		return GameExtendedQueryImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun saveGameExtended(database: ArangoDatabase, game: GameExtendedEntity) {
		GameExtendedUpdateImpl(database).execute(game)
	}

	suspend fun getCommands(database: ArangoDatabase, gameId: String, turn: Int): List<CommandEntity<*>> {
		return CommandsByGameQueryImpl(database).execute(gameId, turn)
	}

	suspend fun getPlayers(database: ArangoDatabase, gameId: String): List<PlayerEntity> {
		return GameQueryImpl(database).execute(gameId)
			.getOrHandle { throw Exception("Game $gameId not found") }
			.players
	}

	suspend fun getMarkersAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<Pair<TileEntity, MarkerTileContent>> {
		return getMarkers(database, gameId)
			.filter { it.first.position.q == q && it.first.position.r == r }
	}

	suspend fun getMarkers(database: ArangoDatabase, gameId: String): List<Pair<TileEntity, MarkerTileContent>> {
		return getTiles(database, gameId)
			.filter { it.content.isNotEmpty() }
			.flatMap { tile -> tile.content.map { tile to it } }
			.filter { it.second is MarkerTileContent }
			.map { it.first to (it.second as MarkerTileContent) }
	}

	suspend fun getCitiesAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<CityEntity> {
		val tile = getTiles(database, gameId).first { it.position.q == q && it.position.r == r }
		return getCities(database, gameId).filter { it.tile.tileId == tile.key }
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
		)
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
		)
	}

	suspend fun <R> withGameExtended(database: ArangoDatabase, gameId: String, block: suspend (game: GameExtendedEntity) -> R): R {
		return getGameExtended(database, gameId).let {
			val result = block(it)
			saveGameExtended(database, it)
			result
		}
	}

}