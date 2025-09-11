package io.github.smiley4.strategygame.backend.commonarangodb

import com.arangodb.serde.jackson.Key
import com.fasterxml.jackson.annotation.JsonIgnore

open class DbEntity(
	@field:Key val key: String? = null,
) {
	@JsonIgnore
	fun getKeyOrThrow() = key ?: throw Exception("Requested key of db-entity is null ($this)")
}