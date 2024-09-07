package io.github.smiley4.strategygame.backend.commondata


class Command<T : CommandData>(
    val id: Id,
    val game: Game.Id,
    val user: User.Id,
    val turn: Int,
    val data: T
) {
    @JvmInline
    value class Id(val value: String)

}

sealed class CommandData {

    class Move(
        val worldObject: WorldObject.Id,
        val path: List<TileRef>
    ) : CommandData()

    class CreateSettlementDirect(
        val name: String,
        val tile: TileRef
    ) : CommandData()

    class CreateSettlementWithSettler(
        val name: String,
        val worldObject: WorldObject.Id
    ) : CommandData()

    class ProductionQueueRemoveEntry(
        val entry: ProductionQueueEntry.Id,
        val settlement: Settlement.Id
    ) : CommandData()

    sealed class ProductionQueueAddEntry(
        val settlement: Settlement.Id
    ) : CommandData() {

        class Settler(settlement: Settlement.Id) : ProductionQueueAddEntry(settlement)

    }

}
