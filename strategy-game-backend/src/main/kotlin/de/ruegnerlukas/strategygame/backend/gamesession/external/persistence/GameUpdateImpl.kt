package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

    private val metricId = MetricId.query(GameUpdate::class)

    override suspend fun execute(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return time(metricId) {
            database.replaceDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
                .mapLeft { EntityNotFoundError }
                .void()
        }
    }

}