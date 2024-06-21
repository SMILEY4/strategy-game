package io.github.smiley4.strategygame.backend.commondata


class Command<T : CommandData>(
    val commandId: String,
    val gameId: String,
    val userId: String,
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


class UpgradeSettlementTierCommandData(
    val cityId: String
) : CommandData()


class PlaceMarkerCommandData(
    val q: Int,
    val r: Int,
    val label: String
) : CommandData()

class DeleteMarkerCommandData(
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
    val buildingType: io.github.smiley4.strategygame.backend.common.data.BuildingType
) : ProductionQueueAddEntryCommandData(cityId)


class ProductionQueueAddSettlerEntryCommandData(
    cityId: String,
) : ProductionQueueAddEntryCommandData(cityId)


class ProductionQueueRemoveEntryCommandData(
    val cityId: String,
    val queueEntryId: String
) : CommandData()