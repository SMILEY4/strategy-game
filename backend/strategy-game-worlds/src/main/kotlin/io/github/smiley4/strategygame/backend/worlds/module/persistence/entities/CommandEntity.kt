package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData

internal class CommandEntity<T : CommandEntityData>(
    val userId: String,
    val gameId: String,
    val turn: Int,
    val data: T,
    key: String? = null,
) : DbEntity(key) {

    companion object {

        fun of(serviceModel: Command<*>) = CommandEntity(
            key = DbId.asDbId(serviceModel.commandId),
            userId = serviceModel.userId,
            gameId = serviceModel.gameId,
            turn = serviceModel.turn,
            data = of(serviceModel.data)
        )

        private fun of(serviceModel: CommandData): CommandEntityData {
            return when (serviceModel) {
                is MoveCommandData -> MoveCommandEntityData(
                    worldObjectId = serviceModel.worldObjectId,
                    path = serviceModel.path.map { TileRefEntity.of(it) },
                )
                is CreateSettlementDirectCommandData -> CreateSettlementDirectCommandEntityData(
                    name = serviceModel.name,
                    tile = TileRefEntity.of(serviceModel.tile)
                )
                is CreateSettlementWithSettlerCommandData -> CreateSettlementWithSettlerCommandEntityData(
                    name = serviceModel.name,
                    worldObjectId = serviceModel.worldObjectId
                )
                is ProductionQueueRemoveEntryCommandData -> ProductionQueueRemoveEntryCommandEntityData(
                    entryId = serviceModel.entryId,
                    settlementId = serviceModel.settlementId
                )
                is ProductionQueueAddEntryCommandData.Settler -> ProductionQueueAddSettlerCommandEntityData(
                    settlementId = serviceModel.settlementId
                )
            }
        }

    }

    fun asServiceModel() = Command(
        commandId = this.getKeyOrThrow(),
        userId = this.userId,
        gameId = this.gameId,
        turn = this.turn,
        data = asServiceModel(this.data)
    )

    private fun asServiceModel(entity: CommandEntityData): CommandData {
        return when (entity) {
            is MoveCommandEntityData -> MoveCommandData(
                worldObjectId = entity.worldObjectId,
                path = entity.path.map { it.asServiceModel() },
            )
            is CreateSettlementDirectCommandEntityData -> CreateSettlementDirectCommandData(
                name = entity.name,
                tile = entity.tile.asServiceModel()
            )
            is CreateSettlementWithSettlerCommandEntityData -> CreateSettlementWithSettlerCommandData(
                name = entity.name,
                worldObjectId = entity.worldObjectId,
            )
            is ProductionQueueRemoveEntryCommandEntityData -> ProductionQueueRemoveEntryCommandData(
                entryId = entity.entryId,
                settlementId = entity.settlementId
            )
            is ProductionQueueAddSettlerCommandEntityData -> ProductionQueueAddEntryCommandData.Settler(
                settlementId = entity.settlementId
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