package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

data class Country(
    val countryId: String,
    val userId: String,
    val color: RGBColor,
    var availableSettlers: Int
)
