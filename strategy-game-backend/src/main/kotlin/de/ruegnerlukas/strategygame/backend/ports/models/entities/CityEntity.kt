package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

class CityEntity(
	val gameId: String,
	val tile: TileRef,
	val name: String
) : DbEntity()