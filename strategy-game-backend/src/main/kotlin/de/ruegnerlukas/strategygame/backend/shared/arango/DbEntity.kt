package de.ruegnerlukas.strategygame.backend.shared.arango

import com.arangodb.entity.Key

open class DbEntity(
	@Key val id: String? = null,
)