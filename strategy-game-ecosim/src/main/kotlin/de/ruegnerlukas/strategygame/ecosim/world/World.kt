package de.ruegnerlukas.strategygame.ecosim.world

data class World(
    val cities: List<City>,
    var agricultureEfficiency: Float
)