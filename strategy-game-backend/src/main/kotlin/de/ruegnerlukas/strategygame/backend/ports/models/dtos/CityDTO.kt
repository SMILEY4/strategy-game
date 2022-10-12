package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.entities.BuildingType

data class CityDTO(
	val cityId: String,
	val countryId: String,
	val tile: TileRef,
	val name: String,
	val color: RGBColor,
	val city: Boolean,
	val parentCity: String?,
	val buildings: List<BuildingDTO>
)


data class BuildingDTO(
	val type: String,
	val tile: TileRef?
)
