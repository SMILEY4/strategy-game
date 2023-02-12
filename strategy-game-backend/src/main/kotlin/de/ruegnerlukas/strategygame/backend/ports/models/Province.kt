package de.ruegnerlukas.strategygame.backend.ports.models

data class Province(
	val provinceId: String,
	val countryId: String,
	val cityIds: MutableList<String>,
	val provinceCapitalCityId: String,

	var resourcesProducedPrevTurn: ResourceStats = ResourceStats(),
	var resourcesProducedCurrTurn: ResourceStats = ResourceStats(),
	var resourcesConsumedCurrTurn: ResourceStats = ResourceStats(),
	var resourcesMissing: ResourceStats = ResourceStats(),

	val tradeRoutes: MutableList<TradeRoute>,

	// todo: non persistent data
	val resourceBalance: MutableMap<ResourceType, Float> = mutableMapOf(),
	val resourceDemands: MutableMap<ResourceType, Float> = mutableMapOf()

)
