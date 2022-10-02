package de.ruegnerlukas.strategygame.backend.external.persistence.arango

import com.arangodb.entity.Key
import com.fasterxml.jackson.annotation.JsonIgnore

open class DbEntity(
	@Key val key: String? = null,
) {
	@JsonIgnore
	fun getKeyOrThrow() = key ?: throw Exception("Requested key of db-entity is null ($this)")
}