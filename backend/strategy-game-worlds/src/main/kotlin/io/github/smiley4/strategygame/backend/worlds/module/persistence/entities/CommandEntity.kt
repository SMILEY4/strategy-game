package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.TileRef

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
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MoveCommandEntityData::class),
    JsonSubTypes.Type(value = CreateSettlementDirectCommandEntityData::class),
    JsonSubTypes.Type(value = CreateSettlementWithSettlerCommandEntityData::class),
)
internal sealed class CommandEntityData(
    val type: String
)


@JsonTypeName(MoveCommandEntityData.TYPE)
internal class MoveCommandEntityData(
    val worldObjectId: String,
    val path: List<TileRefEntity>,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "move"
    }
}

@JsonTypeName(CreateSettlementDirectCommandEntityData.TYPE)
internal class CreateSettlementDirectCommandEntityData(
    val name: String,
    val tile: TileRefEntity
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-settlement-direct"
    }
}


@JsonTypeName(CreateSettlementWithSettlerCommandEntityData.TYPE)
internal class CreateSettlementWithSettlerCommandEntityData(
    val name: String,
    val worldObjectId: String
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-settlement-settler"
    }
}
