package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameInsert
import de.ruegnerlukas.strategygame.backend.common.getOrThrow

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

    private val metricId = metricDbQuery(GameInsert::class)

    override suspend fun execute(game: Game, tiles: List<Tile>): String {
        return Monitoring.coTime(metricId) {
            val gameId = insertGame(game)
            insertTiles(gameId, tiles)
            gameId
        }
    }

    private suspend fun insertGame(game: Game): String {
        return database.insertDocument(Collections.GAMES, GameEntity.of(game)).getOrThrow().key
    }

    private suspend fun insertTiles(gameId: String, tiles: List<Tile>) {
        database.insertDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

}