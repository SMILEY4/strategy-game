package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity

data class Country(
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    val resources: CountryResources,
) : DbEntity()

