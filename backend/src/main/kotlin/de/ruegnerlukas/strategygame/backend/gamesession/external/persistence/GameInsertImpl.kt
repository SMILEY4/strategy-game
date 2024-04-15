package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.utils.getOrThrow
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameInsert

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

    private val metricId = MetricId.query(GameInsert::class)

    override suspend fun execute(game: Game): String {
        return time(metricId) {
            insertGame(game)
        }
    }

    private suspend fun insertGame(game: Game): String {
        return database.insertDocument(Collections.GAMES, GameEntity.of(game)).key
    }

}