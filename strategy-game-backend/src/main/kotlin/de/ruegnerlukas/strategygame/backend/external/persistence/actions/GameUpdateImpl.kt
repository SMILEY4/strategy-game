package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

    private val metricId = metricDbQuery(GameUpdate::class)

    override suspend fun execute(game: GameEntity): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            database.replaceDocument(Collections.GAMES, game.getKeyOrThrow(), game)
                .mapLeft { EntityNotFoundError }
                .void()
        }
    }

}