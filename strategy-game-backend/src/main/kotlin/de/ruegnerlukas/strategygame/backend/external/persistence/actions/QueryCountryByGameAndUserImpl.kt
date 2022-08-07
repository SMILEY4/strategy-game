package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryCountryByGameAndUser
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class QueryCountryByGameAndUserImpl(private val database: ArangoDatabase) : QueryCountryByGameAndUser {

	private val query = """
		FOR country IN ${Collections.COUNTRIES}
			FILTER country.gameId == @gameId AND country.userId == @userId
			RETURN country
	""".trimIndent()

	override suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, CountryEntity> {
		database.assertCollections(Collections.COUNTRIES)
		val result = database
			.query(query, mapOf("gameId" to gameId, "userId" to userId), CountryEntity::class.java)
			.toList()
		if (result.size == 1) {
			return result.stream().findFirst().get().right()
		} else {
			return EntityNotFoundError.left()
		}
	}

}