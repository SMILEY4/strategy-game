package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.entities.ProvinceEntity

data class ProvinceDTO(
	val provinceId: String,
	val countryId: String,
) {
	constructor(province: ProvinceEntity) : this(
		provinceId = province.getKeyOrThrow(),
		countryId = province.countryId
	)
}
