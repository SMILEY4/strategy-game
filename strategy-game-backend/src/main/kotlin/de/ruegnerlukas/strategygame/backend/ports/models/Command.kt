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

class ProductionQueueAddEntryCommandData(
    val cityId: String,
    val buildingType: BuildingType
) : CommandData()