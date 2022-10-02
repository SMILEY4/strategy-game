package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class CountryByGameAndUserQueryImpl(private val database: ArangoDatabase) : CountryByGameAndUserQuery {

	override suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, CountryEntity> {
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
			.mapLeft { EntityNotFoundError }
	}

}