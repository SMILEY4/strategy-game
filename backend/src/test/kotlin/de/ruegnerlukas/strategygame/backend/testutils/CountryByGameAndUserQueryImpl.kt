package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.CountryEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country

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