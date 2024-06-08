package io.github.smiley4.strategygame.backend.app.testutils

import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CountryEntity
import io.github.smiley4.strategygame.backend.engine.ports.models.Country


class CountryByGameAndUserQueryImpl(private val database: ArangoDatabase) {

    suspend fun execute(gameId: String, userId: String): Country {
        database.assertCollections(Collections.COUNTRIES)
        try {
            return database
                .querySingle(
                    """
					FOR country IN ${Collections.COUNTRIES}
						FILTER country.gameId == @gameId AND country.userId == @userId
						RETURN country
                    """.trimIndent(),
                    mapOf("gameId" to gameId, "userId" to userId),
                    CountryEntity::class.java
                )
                .asServiceModel()
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

}