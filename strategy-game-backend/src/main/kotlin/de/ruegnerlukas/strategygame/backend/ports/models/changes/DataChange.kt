package de.ruegnerlukas.strategygame.backend.ports.models.changes

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity

interface DataChange

data class InsertMarkerChange(
	val marker: MarkerEntity
) : DataChange

data class InsertCityChange(
	val city: CityEntity
) : DataChange

data class ModifyMoneyChange(
	val countryId: String,
	val change: Float,
) : DataChange