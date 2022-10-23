package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

    private val metricId = metricDbQuery(GameQuery::class)

    override suspend fun execute(gameId: String): Either<EntityNotFoundError, Game> {
        return Monitoring.coTime(metricId) {
            database
                .getDocument(Collections.GAMES, gameId, GameEntity::class.java).map { it.asServiceModel() }
                .mapLeft { EntityNotFoundError }
        }
    }

}