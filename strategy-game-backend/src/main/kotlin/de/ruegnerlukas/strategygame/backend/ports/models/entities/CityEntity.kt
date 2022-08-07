package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

class CityEntity(
	val gameId: String,
	val tileId: String,
) : DbEntity()