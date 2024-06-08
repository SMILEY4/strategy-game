package io.github.smiley4.strategygame.backend.engine.ports.models

import io.github.smiley4.strategygame.backend.common.utils.RGBColor


data class Country(
    val countryId: String,
    val userId: String,
    val color: RGBColor,
    var availableSettlers: Int
)
