package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User

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
                is CommandData.NoOp -> NoOpCommandEntityData()
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
            is NoOpCommandEntityData -> CommandData.NoOp()
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.SIMPLE_NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class CommandEntityData

internal class NoOpCommandEntityData() : CommandEntityData()