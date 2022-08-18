package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

class ProvinceEntity(
	val gameId: String,
	val countryId: String,
	key: String? = null,
) : DbEntity(key)