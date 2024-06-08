package io.github.smiley4.strategygame.backend.app.testutils

import io.github.smiley4.strategygame.backend.common.models.MarkerTileObject
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedQueryImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedUpdateImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CityEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CountryEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.ProvinceEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.TileEntity
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.github.smiley4.strategygame.backend.worlds.external.persistence.CommandsByGameQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameQueryImpl
import io.github.smiley4.strategygame.backend.common.models.Command
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.common.models.Player


object TestUtils {

    enum class TileDirection(val q: Int, val r: Int) {
        TOP_LEFT(-1, +1),
        TOP_RIGHT(+0, +1),
        LEFT(-1, +0),
        RIGHT(+0, +0),
        BOTTOM_LEFT(+1, +0),
        BOTTOM_RIGHT(+0, -1),
        CENTER(+1, -1),
    }

    fun TilePosition.topLeft() = this.direction(TileDirection.TOP_LEFT)
    fun TilePosition.topRight() = this.direction(TileDirection.TOP_RIGHT)
    fun TilePosition.left() = this.direction(TileDirection.LEFT)
    fun TilePosition.right() = this.direction(TileDirection.RIGHT)
    fun TilePosition.bottomLeft() = this.direction(TileDirection.BOTTOM_LEFT)
    fun TilePosition.bottomRight() = this.direction(TileDirection.BOTTOM_RIGHT)
    fun TilePosition.center() = this.direction(TileDirection.CENTER)
    fun TilePosition.direction(dir: TileDirection) = TilePosition(this.q + dir.q, this.r - dir.r)


    suspend fun getPlayer(database: ArangoDatabase, userId: String, gameId: String): Player {
        return getPlayers(database, gameId).first { it.userId == userId }
    }

    suspend fun getCountry(database: ArangoDatabase, countryId: String): Country {
        return database.getDocument(Collections.COUNTRIES, countryId, CountryEntity::class.java).asServiceModel()
    }

    suspend fun getCountry(database: ArangoDatabase, gameId: String, userId: String): Country {
        return CountryByGameAndUserQueryImpl(database).execute(gameId, userId)
    }

    suspend fun updateCountry(database: ArangoDatabase, gameId: String, country: Country) {
        val entity = CountryEntity.of(country, gameId)
        database.replaceDocument(Collections.COUNTRIES, entity.getKeyOrThrow(), entity)
    }

    suspend fun getGame(database: ArangoDatabase, gameId: String): Game {
        return GameQueryImpl(database).execute(gameId)
    }

    suspend fun getGameExtended(database: ArangoDatabase, gameId: String): GameExtended {
        return GameExtendedQueryImpl(database).execute(gameId)
    }

    suspend fun saveGameExtended(database: ArangoDatabase, game: GameExtended) {
        GameExtendedUpdateImpl(database).execute(game)
    }

    suspend fun getCommands(database: ArangoDatabase, gameId: String, turn: Int): List<Command<*>> {
        return CommandsByGameQueryImpl(database).execute(gameId, turn)
    }

    suspend fun getPlayers(database: ArangoDatabase, gameId: String): List<Player> {
        return GameQueryImpl(database).execute(gameId).players.toList()
    }

    suspend fun getMarkersAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<Pair<Tile, MarkerTileObject>> {
        return getMarkers(database, gameId)
            .filter { it.first.position.q == q && it.first.position.r == r }
    }

    suspend fun getMarkers(database: ArangoDatabase, gameId: String): List<Pair<Tile, MarkerTileObject>> {
        return getTiles(database, gameId)
            .filter { it.objects.isNotEmpty() }
            .flatMap { tile -> tile.objects.map { tile to it } }
            .filter { it.second is MarkerTileObject }
            .map { it.first to (it.second as MarkerTileObject) }
    }

    suspend fun getCitiesAt(database: ArangoDatabase, gameId: String, q: Int, r: Int): List<City> {
        val tile = getTiles(database, gameId).first { it.position.q == q && it.position.r == r }
        return getCities(database, gameId).filter { it.tile.tileId == tile.tileId }
    }

    suspend fun getCities(database: ArangoDatabase, gameId: String): List<City> {
        return database.query(
            """
				FOR city IN ${Collections.CITIES}
					FILTER city.gameId == @gameId
					RETURN city
			""".trimIndent(),
            mapOf("gameId" to gameId),
            CityEntity::class.java
        ).map { it.asServiceModel() }
    }

    suspend fun getTiles(database: ArangoDatabase, gameId: String): List<Tile> {
        return database.query(
            """
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
            mapOf("gameId" to gameId),
            TileEntity::class.java
        ).map { it.asServiceModel() }
    }

    suspend fun getProvinceByCityId(database: ArangoDatabase, cityId: String): Province {
        return database
            .querySingle(
                """
                    FOR province IN ${Collections.PROVINCES}
                        FILTER @cityId IN province.cityIds
                        RETURN province
			    """.trimIndent(),
                mapOf("cityId" to cityId),
                ProvinceEntity::class.java
            )
            .asServiceModel()
    }

    suspend fun <R> withGameExtended(database: ArangoDatabase, gameId: String, block: suspend (game: GameExtended) -> R): R {
        return getGameExtended(database, gameId).let {
            val result = block(it)
            saveGameExtended(database, it)
            result
        }
    }

}