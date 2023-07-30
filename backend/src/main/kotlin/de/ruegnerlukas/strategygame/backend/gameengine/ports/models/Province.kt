package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,

    var resourcesProducedPrevTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesProducedCurrTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesConsumedCurrTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesMissing: ResourceCollection = ResourceCollection.basic(),
) {

    fun findCountry(game: GameExtended): Country = game.findCountry(countryId)

    fun findCities(game: GameExtended): List<City>  = cityIds.map { game.findCity(it) }

    fun findCapitalCity(game: GameExtended): City = game.findCity(provinceCapitalCityId)

}