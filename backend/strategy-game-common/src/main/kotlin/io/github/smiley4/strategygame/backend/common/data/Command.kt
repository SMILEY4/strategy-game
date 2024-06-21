package io.github.smiley4.strategygame.backend.common.data


class Command<T : io.github.smiley4.strategygame.backend.common.data.CommandData>(
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
) : io.github.smiley4.strategygame.backend.common.data.CommandData()


class UpgradeSettlementTierCommandData(
    val cityId: String
) : io.github.smiley4.strategygame.backend.common.data.CommandData()


class PlaceMarkerCommandData(
    val q: Int,
    val r: Int,
    val label: String
) : io.github.smiley4.strategygame.backend.common.data.CommandData()

class DeleteMarkerCommandData(
    val q: Int,
    val r: Int
) : io.github.smiley4.strategygame.backend.common.data.CommandData()

class PlaceScoutCommandData(
    val q: Int,
    val r: Int
) : io.github.smiley4.strategygame.backend.common.data.CommandData()


sealed class ProductionQueueAddEntryCommandData(
    val cityId: String,
) : io.github.smiley4.strategygame.backend.common.data.CommandData()


class ProductionQueueAddBuildingEntryCommandData(
    cityId: String,
    val buildingType: io.github.smiley4.strategygame.backend.common.data.BuildingType
) : io.github.smiley4.strategygame.backend.common.data.ProductionQueueAddEntryCommandData(cityId)


class ProductionQueueAddSettlerEntryCommandData(
    cityId: String,
) : io.github.smiley4.strategygame.backend.common.data.ProductionQueueAddEntryCommandData(cityId)


class ProductionQueueRemoveEntryCommandData(
    val cityId: String,
    val queueEntryId: String
) : io.github.smiley4.strategygame.backend.common.data.CommandData()