package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CommandData.Disband
import io.github.smiley4.strategygame.backend.commondata.CommandData.Move
import io.github.smiley4.strategygame.backend.commondata.utils.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.WorldObject.Id

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
                is Move -> MoveCommandEntityData(
                    worldObject = serviceModel.worldObject.value,
                    path = serviceModel.path.map { TileRefEntity.of(it) }
                )
                is Disband -> DisbandCommandEntityData(
                    worldObject = serviceModel.worldObject.value,
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
            is MoveCommandEntityData -> Move(
                worldObject = Id(entity.worldObject),
                path = entity.path.map { it.asServiceModel() }
            )
            is DisbandCommandEntityData -> Disband(
                worldObject = Id(entity.worldObject),
            )
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.SIMPLE_NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class CommandEntityData

internal class MoveCommandEntityData(
    val worldObject: String,
    val path: List<TileRefEntity>,
) : CommandEntityData()


internal class DisbandCommandEntityData(
    val worldObject: String,
) : CommandEntityData()
