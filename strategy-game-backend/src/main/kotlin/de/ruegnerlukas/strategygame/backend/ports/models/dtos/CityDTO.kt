package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity

data class CityDTO(
	val cityId: String,
	val countryId: String,
	val tile: TileRef,
	val name: String,
) {
	constructor(city: CityEntity) : this(
		city.key!!,
		city.countryId,
		city.tile,
		city.name
	)
}