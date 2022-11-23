package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.parallelIO

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

    private val metricId = metricDbQuery(GameExtendedUpdate::class)

    override suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            either {
                val gameId = game.game.gameId
                updateGame(game.game).bind()
                parallelIO(
                    { updateCountries(game.countries, gameId) },
                    { updateTiles(game.tiles, gameId) },
                    { updateCities(game.cities, gameId) },
                    { deleteCities(game.cities.getRemovedElements(), gameId) },
                    { updateProvinces(game.provinces, gameId) },
                    { deleteProvinces(game.provinces.getRemovedElements(), gameId) },
                )
            }
        }
    }

    private suspend fun updateGame(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return database.updateDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
            .mapLeft { EntityNotFoundError }
            .void()
    }

    private suspend fun updateCountries(countries: List<Country>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) })
    }

    private suspend fun updateTiles(tiles: List<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateCities(cities: List<City>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) })
    }

    private suspend fun deleteCities(cities: Set<City>, gameId: String) {
        database.deleteDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateProvinces(provinces: List<Province>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) })
    }

    private suspend fun deleteProvinces(provinces: Set<Province>, gameId: String) {
        database.deleteDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}