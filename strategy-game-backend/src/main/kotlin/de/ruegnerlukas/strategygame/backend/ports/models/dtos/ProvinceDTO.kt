package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor

data class ProvinceDTO(
	val provinceId: String,
	val countryId: String,
	val color: RGBColor
)