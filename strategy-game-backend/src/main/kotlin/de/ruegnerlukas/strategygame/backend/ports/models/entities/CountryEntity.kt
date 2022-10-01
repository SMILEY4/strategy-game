package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity

data class CountryEntity(
	val gameId: String,
	val userId: String,
	val color: RGBColor,
	val resources: CountryResources,
) : DbEntity()

data class CountryResources(
	var money: Float
)