package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError

class CountryByGameAndUserQueryImpl(private val database: ArangoDatabase) : CountryByGameAndUserQuery {

    override suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, Country> {
        database.assertCollections(Collections.COUNTRIES)
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
            .map { it.asServiceModel() }
            .mapLeft { EntityNotFoundError }
    }

}