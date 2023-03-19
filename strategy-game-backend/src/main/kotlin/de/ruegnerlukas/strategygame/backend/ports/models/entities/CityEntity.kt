package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

class CityEntity(
	val gameId: String,
	val countryId: String,
	val provinceId: String,
	val tile: TileRef,
	val name: String,
	key: String? = null,
) : DbEntity(key)