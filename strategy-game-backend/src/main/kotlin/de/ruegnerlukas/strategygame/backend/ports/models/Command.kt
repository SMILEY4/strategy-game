package de.ruegnerlukas.strategygame.backend.ports.models

class Command<T : CommandData>(
    val commandId: String,
    val countryId: String,
    val turn: Int,
    val data: T
)

sealed class CommandData {
    fun displayName() = this::class.simpleName ?: "?"
}

class CreateCityCommandData(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean
) : CommandData()

class PlaceMarkerCommandData(
    val q: Int,
    val r: Int
) : CommandData()

class PlaceScoutCommandData(
    val q: Int,
    val r: Int
) : CommandData()

sealed class ProductionQueueAddEntryCommandData(
    val cityId: String,
) : CommandData()

class ProductionQueueAddBuildingEntryCommandData(
    cityId: String,
    val buildingType: BuildingType
) : ProductionQueueAddEntryCommandData(cityId)

class ProductionQueueAddSettlerEntryCommandData(
    cityId: String,
) : ProductionQueueAddEntryCommandData(cityId)

class ProductionQueueRemoveEntryCommandData(
    val cityId: String,
    val queueEntryId: String
) : CommandData()