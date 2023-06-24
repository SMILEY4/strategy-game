package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

class CountryByGameAndUserQueryImpl(private val database: ArangoDatabase) : CountryByGameAndUserQuery {

    private val metricId = metricDbQuery(CountryByGameAndUserQuery::class)

    override suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, Country> {
        return Monitoring.coTime(metricId) {
            database.assertCollections(Collections.COUNTRIES)
            database
                .querySingle(
                    """
					FOR country IN ${Collections.COUNTRIES}
						FILTER country.gameId == @gameId AND country.userId == @userId
						RETURN country
                    """.trimIndent(),
                    mapOf("gameId" to gameId, "userId" to userId),
                    CountryEntity::class.java
                )
                .map { it.asServiceModel() }
                .mapLeft { EntityNotFoundError }
        }
    }

}