package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.RGBColor

data class Country(
    val countryId: String,
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    val resources: CountryResources,
)
