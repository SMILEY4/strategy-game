package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor

data class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    val resources: CountryResources,
) : DbEntity()

data class CountryResources(
    var money: Float,
    var wood: Float,
    var food: Float,
    var stone: Float,
    var metal: Float,
)