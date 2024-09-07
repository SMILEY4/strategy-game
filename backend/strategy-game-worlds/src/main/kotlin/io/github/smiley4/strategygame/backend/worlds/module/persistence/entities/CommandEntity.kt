package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.WorldObject

internal class CommandEntity<T : CommandEntityData>(
    val userId: String,
    val gameId: String,
    val turn: Int,
    val data: T,
    key: String? = null,
) : DbEntity(key) {

    companion object {

        fun of(serviceModel: Command<*>) = CommandEntity(
            key = DbId.asDbId(serviceModel.id.value),
            userId = serviceModel.user.value,
            gameId = serviceModel.game.value,
            turn = serviceModel.turn,
            data = of(serviceModel.data)
        )

        private fun of(serviceModel: CommandData): CommandEntityData {
            return when (serviceModel) {
                is CommandData.Move -> MoveCommandEntityData(
                    worldObjectId = serviceModel.worldObject.value,
                    path = serviceModel.path.map { TileRefEntity.of(it) },
                )
                is CommandData.CreateSettlementDirect -> CreateSettlementDirectCommandEntityData(
                    name = serviceModel.name,
                    tile = TileRefEntity.of(serviceModel.tile)
                )
                is CommandData.CreateSettlementWithSettler -> CreateSettlementWithSettlerCommandEntityData(
                    name = serviceModel.name,
                    worldObjectId = serviceModel.worldObject.value
                )
                is CommandData.ProductionQueueRemoveEntry -> ProductionQueueRemoveEntryCommandEntityData(
                    entryId = serviceModel.entry.value,
                    settlementId = serviceModel.settlement.value
                )
                is CommandData.ProductionQueueAddEntry.Settler -> ProductionQueueAddSettlerCommandEntityData(
                    settlementId = serviceModel.settlement.value
                )
            }
        }

    }

    fun asServiceModel() = Command(
        id = Command.Id(this.getKeyOrThrow()),
        user = User.Id(this.userId),
        game = Game.Id(this.gameId),
        turn = this.turn,
        data = asServiceModel(this.data)
    )

    private fun asServiceModel(entity: CommandEntityData): CommandData {
        return when (entity) {
            is MoveCommandEntityData -> CommandData.Move(
                worldObject = WorldObject.Id(entity.worldObjectId),
                path = entity.path.map { it.asServiceModel() },
            )
            is CreateSettlementDirectCommandEntityData -> CommandData.CreateSettlementDirect(
                name = entity.name,
                tile = entity.tile.asServiceModel()
            )
            is CreateSettlementWithSettlerCommandEntityData -> CommandData.CreateSettlementWithSettler(
                name = entity.name,
                worldObject = WorldObject.Id(entity.worldObjectId),
            )
            is ProductionQueueRemoveEntryCommandEntityData -> CommandData.ProductionQueueRemoveEntry(
                entry = ProductionQueueEntry.Id(entity.entryId),
                settlement = Settlement.Id(entity.settlementId)
            )
            is ProductionQueueAddSettlerCommandEntityData -> CommandData.ProductionQueueAddEntry.Settler(
                settlement = Settlement.Id(entity.settlementId)
            )
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class CommandEntityData

internal class MoveCommandEntityData(
    val worldObjectId: String,
    val path: List<TileRefEntity>,
) : CommandEntityData()

internal class CreateSettlementDirectCommandEntityData(
    val name: String,
    val tile: TileRefEntity
) : CommandEntityData()

internal class CreateSettlementWithSettlerCommandEntityData(
    val name: String,
    val worldObjectId: String
) : CommandEntityData()


internal class ProductionQueueRemoveEntryCommandEntityData(
    val entryId: String,
    val settlementId: String
) : CommandEntityData()


internal class ProductionQueueAddSettlerCommandEntityData(
    val settlementId: String
) : CommandEntityData()