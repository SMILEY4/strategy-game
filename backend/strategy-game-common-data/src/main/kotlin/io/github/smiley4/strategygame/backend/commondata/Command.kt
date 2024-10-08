package io.github.smiley4.strategygame.backend.commondata


class Command<T : CommandData>(
    val commandId: String,
    val gameId: String,
    val userId: String,
    val turn: Int,
    val data: T
)

sealed class CommandData

class MoveCommandData(
    val worldObjectId: String,
    val path: List<TileRef>
) : CommandData()

class CreateSettlementDirectCommandData(
    val name: String,
    val tile: TileRef
) : CommandData()

class CreateSettlementWithSettlerCommandData(
    val name: String,
    val worldObjectId: String
) : CommandData()

class ProductionQueueRemoveEntryCommandData(
    val entryId: String,
    val settlementId: String
) : CommandData()

sealed class ProductionQueueAddEntryCommandData(
    val settlementId: String
) : CommandData() {

    class Settler(settlementId: String) : ProductionQueueAddEntryCommandData(settlementId)

}

