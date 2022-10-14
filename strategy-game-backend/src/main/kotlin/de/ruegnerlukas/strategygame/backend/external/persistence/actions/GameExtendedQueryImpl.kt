package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import arrow.fx.coroutines.parZip
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.tracking

class GameExtendedQueryImpl(private val database: ArangoDatabase) : GameExtendedQuery {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtended> {
		return either {
			val game = fetchGame(gameId).bind()
			parZip(
				{ fetchCountries(gameId) },
				{ fetchTiles(gameId) },
				{ fetchCities(gameId) }
			) { countries, tiles, cities ->
				GameExtended(
					game = game,
					countries = countries,
					tiles = tiles,
					cities = cities.tracking(),
				)
			}
		}
	}

	private suspend fun fetchGame(gameId: String): Either<EntityNotFoundError, Game> {
		return database.getDocument(Collections.GAMES, gameId, Game::class.java).mapLeft { EntityNotFoundError }
	}

	private suspend fun fetchCountries(gameId: String): List<Country> {
		database.assertCollections(Collections.COUNTRIES)
		return database.query(
			"""
				FOR country IN ${Collections.COUNTRIES}
					FILTER country.gameId == @gameId
					RETURN country
			""".trimIndent(),
			mapOf("gameId" to gameId),
			Country::class.java
		)
	}

	private suspend fun fetchTiles(gameId: String): List<Tile> {
		database.assertCollections(Collections.TILES)
		return database.query(
			"""
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
			mapOf("gameId" to gameId),
			Tile::class.java
		)
	}

	private suspend fun fetchCities(gameId: String): List<City> {
		database.assertCollections(Collections.CITIES)
		return database.query(
			"""
				FOR city IN ${Collections.CITIES}
					FILTER city._documentType != "reservation"
					FILTER city.gameId == @gameId
					RETURN city
			""".trimIndent(),
			mapOf("gameId" to gameId),
			City::class.java
		)
	}

}