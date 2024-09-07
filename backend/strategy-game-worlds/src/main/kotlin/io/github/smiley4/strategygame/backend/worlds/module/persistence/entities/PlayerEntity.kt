package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.commondata.User

internal class PlayerEntity(
    val userId: String,
    var connectionId: Long?,
    var state: String
) {

    companion object {
        fun of(serviceModel: Player) = PlayerEntity(
            userId = serviceModel.user.value,
            connectionId = serviceModel.connectionId,
            state = when (serviceModel.state) {
                PlayerState.PLAYING -> "playing"
                PlayerState.SUBMITTED -> "submitted"
            }
        )
    }

    fun asServiceModel() = Player(
        user = User.Id(this.userId),
        connectionId = this.connectionId,
        state = when (this.state) {
            "playing" -> PlayerState.PLAYING
            "submitted" -> PlayerState.SUBMITTED
            else -> throw Exception("Invalid player-state: ${this.state}")
        }
    )

}