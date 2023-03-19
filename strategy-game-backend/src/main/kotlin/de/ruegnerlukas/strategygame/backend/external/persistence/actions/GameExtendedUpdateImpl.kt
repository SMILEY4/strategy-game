package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.parallelIO

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

	override suspend fun execute(game: GameExtendedEntity): Either<EntityNotFoundError, Unit> {
		return either {
			updateGame(game.game).bind()
			parallelIO(
				{ updateCountries(game.countries) },
				{ updateTiles(game.tiles) },
				{ updateCities(game.cities) },
				{ deleteCities(game.cities.getRemovedElements()) },
				{ updateProvinces(game.provinces)},
				{ deleteProvinces(game.provinces.getRemovedElements())}
			)
		}
	}

	private suspend fun updateGame(game: GameEntity): Either<EntityNotFoundError, Unit> {
		return database.updateDocument(Collections.GAMES, game.key!!, game)
			.mapLeft { EntityNotFoundError }
			.void()
	}

	private suspend fun updateCountries(countries: List<CountryEntity>) {
		database.insertOrReplaceDocuments(Collections.COUNTRIES, countries)
	}

	private suspend fun updateTiles(tiles: List<TileEntity>) {
		database.insertOrReplaceDocuments(Collections.TILES, tiles)
	}

	private suspend fun updateCities(cities: List<CityEntity>) {
		database.insertOrReplaceDocuments(Collections.CITIES, cities)
	}

	private suspend fun deleteCities(cities: Set<CityEntity>) {
		database.deleteDocuments(Collections.CITIES, cities.map { it.key!! })
	}

	private suspend fun updateProvinces(provinces: List<ProvinceEntity>) {
		database.insertOrReplaceDocuments(Collections.PROVINCES, provinces)
	}

	private suspend fun deleteProvinces(provinces: Set<ProvinceEntity>) {
		database.deleteDocuments(Collections.PROVINCES, provinces.map { it.key!! })
	}

}