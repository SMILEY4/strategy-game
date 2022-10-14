package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.parallelIO

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

    override suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit> {
        return either {
            updateGame(game.game).bind()
            parallelIO(
                { updateCountries(game.countries) },
                { updateTiles(game.tiles) },
                { updateCities(game.cities) },
                { deleteCities(game.cities.getRemovedElements()) },
            )
        }
    }

    private suspend fun updateGame(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return database.updateDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
            .mapLeft { EntityNotFoundError }
            .void()
    }

    private suspend fun updateCountries(countries: List<Country>) {
        database.insertOrReplaceDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it) })
    }

    private suspend fun updateTiles(tiles: List<Tile>) {
        database.insertOrReplaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it) })
    }

    private suspend fun updateCities(cities: List<City>) {
        database.insertOrReplaceDocuments(Collections.CITIES, cities.map { CityEntity.of(it) })
    }

    private suspend fun deleteCities(cities: Set<City>) {
        database.deleteDocuments(Collections.CITIES, cities.map { CityEntity.of(it) }.map { it.getKeyOrThrow() })
    }

}