package de.ruegnerlukas.strategygame.backend.ports.models

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,

    var resourcesProducedPrevTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesProducedCurrTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesConsumedCurrTurn: ResourceCollection = ResourceCollection.basic(),
    var resourcesMissing: ResourceCollection = ResourceCollection.basic(),
)
