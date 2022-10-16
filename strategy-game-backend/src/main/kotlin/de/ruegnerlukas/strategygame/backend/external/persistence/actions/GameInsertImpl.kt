package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.shared.getOrThrow

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

    private val metricId = metricDbQuery(GameInsert::class)

    override suspend fun execute(game: GameEntity, tiles: List<TileEntity>): String {
        return Monitoring.coTime(metricId) {
            val gameKey = database.insertDocument(Collections.GAMES, game).getOrThrow().key
            tiles.forEach { it.gameId = gameKey }
            database.insertDocuments(Collections.TILES, tiles)
            gameKey
        }

    }

}