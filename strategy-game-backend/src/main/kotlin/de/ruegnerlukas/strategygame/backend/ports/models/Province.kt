package de.ruegnerlukas.strategygame.backend.ports.models

data class Province(
    val provinceId: String,
    val countryId: String,
    val cityIds: MutableList<String>,
    val provinceCapitalCityId: String,
    var resourceLedgerPrevTurn: ResourceLedger,
    var resourceLedgerCurrTurn: ResourceLedger,
    val resourceAvailability: MutableMap<ResourceType, Float> = mutableMapOf(),
    val resourceRequirement: MutableMap<ResourceType, Float> = mutableMapOf(),
    val resourceDemands: MutableMap<ResourceType, Float> = mutableMapOf(),
)
