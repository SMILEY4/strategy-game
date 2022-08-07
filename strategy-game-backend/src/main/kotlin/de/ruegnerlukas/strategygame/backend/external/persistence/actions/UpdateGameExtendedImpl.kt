package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGameExtended
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.parallel
import de.ruegnerlukas.strategygame.backend.shared.parallelIO
import kotlinx.coroutines.Dispatchers

class UpdateGameExtendedImpl(private val database: ArangoDatabase) : UpdateGameExtended {

	override suspend fun execute(game: GameExtendedEntity): Either<EntityNotFoundError, Unit> {
		return either {
			updateGame(game.game).bind()
			parallelIO(
				{ updateCountries(game.countries) },
				{ updateTiles(game.tiles) },
				{ updateCities(game.cities) },
				{ deleteCities(game.cities.getRemovedElement()) }
			)
		}
	}

	private suspend fun updateGame(game: GameEntity): Either<EntityNotFoundError, Unit> {
		val result = database.updateDocument(Collections.GAMES, game.id!!, game)
		if (result == null) {
			return EntityNotFoundError.left()
		} else {
			return Unit.right()
		}
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
		database.deleteDocuments(Collections.CITIES, cities.map { it.id })
	}

}