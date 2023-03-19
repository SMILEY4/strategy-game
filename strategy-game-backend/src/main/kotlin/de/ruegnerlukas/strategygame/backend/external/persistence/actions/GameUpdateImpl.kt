package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

    private val metricId = metricDbQuery(GameUpdate::class)

    override suspend fun execute(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return Monitoring.coTime(metricId) {
            database.replaceDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
                .mapLeft { EntityNotFoundError }
                .void()
        }
    }

}