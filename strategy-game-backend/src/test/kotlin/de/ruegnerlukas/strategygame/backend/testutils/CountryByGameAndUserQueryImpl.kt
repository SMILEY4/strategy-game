package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.CountryEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

class CountryByGameAndUserQueryImpl(private val database: ArangoDatabase) {

    private val metricId = metricDbQuery(CountryByGameAndUserQueryImpl::class)

    suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, Country> {
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