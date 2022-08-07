package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import arrow.fx.coroutines.parZip
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.tracking

class GameExtendedQueryImpl(private val database: ArangoDatabase) : GameExtendedQuery {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtendedEntity> {
		return either {
			val game = fetchGame(gameId).bind()
			parZip(
				{ fetchCountries(gameId) },
				{ fetchTiles(gameId) },
				{ fetchCities(gameId) }
			) { countries, tiles, cities ->
				GameExtendedEntity(
					game = game,
					countries = countries,
					tiles = tiles,
					cities = cities.tracking()
				)
			}
		}
	}

	private suspend fun fetchGame(gameId: String): Either<EntityNotFoundError, GameEntity> {
		val game = database.getDocument(Collections.GAMES, gameId, GameEntity::class.java)
		if (game == null) {
			return EntityNotFoundError.left()
		} else {
			return game.right()
		}
	}

	private suspend fun fetchCountries(gameId: String): List<CountryEntity> {
		database.assertCollections(Collections.COUNTRIES)
		return database.query(
			"""
				FOR country IN ${Collections.COUNTRIES}
					FILTER country.gameId == @gameId
					RETURN country
			""".trimIndent(),
			mapOf("gameId" to gameId),
			CountryEntity::class.java
		)?.toList() ?: emptyList()
	}


	private suspend fun fetchTiles(gameId: String): List<TileEntity> {
		database.assertCollections(Collections.TILES)
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

	private suspend fun fetchCities(gameId: String): List<CityEntity> {
		database.assertCollections(Collections.CITIES)
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

}