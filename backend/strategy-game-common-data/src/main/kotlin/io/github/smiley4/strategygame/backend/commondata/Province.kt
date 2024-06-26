package io.github.smiley4.strategygame.backend.commondata

import io.github.smiley4.strategygame.backend.common.utils.RGBColor


data class Province(
    val provinceId: String,
    val countryId: String,
    val color: RGBColor,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,
    var resourceLedger: ResourceLedger
) {

    fun findCountry(game: GameExtended): Country = game.findCountry(countryId)

    fun findCities(game: GameExtended): List<City> = cityIds.map { game.findCity(it) }

    fun findCapitalCity(game: GameExtended): City = game.findCity(provinceCapitalCityId)

}