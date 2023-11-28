package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.economy.ledger.ResourceLedger

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,
    val color: RGBColor,
    var resourceLedger: ResourceLedger
) {

    fun findCountry(game: GameExtended): Country = game.findCountry(countryId)

    fun findCities(game: GameExtended): List<City> = cityIds.map { game.findCity(it) }

    fun findCapitalCity(game: GameExtended): City = game.findCity(provinceCapitalCityId)

}
