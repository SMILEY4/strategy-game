package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef

data class CityDTO(
	val cityId: String,
	val countryId: String,
	val tile: TileRef,
	val name: String,
	val color: RGBColor
)