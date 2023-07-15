package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

    private val metricId = MetricId.query(GameQuery::class)

    override suspend fun execute(gameId: String): Either<EntityNotFoundError, Game> {
        return time(metricId) {
            database
                .getDocument(Collections.GAMES, gameId, GameEntity::class.java).map { it.asServiceModel() }
                .mapLeft { EntityNotFoundError }
        }
    }

}