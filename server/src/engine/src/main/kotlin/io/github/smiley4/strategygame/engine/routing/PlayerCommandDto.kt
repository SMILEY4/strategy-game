package io.github.smiley4.strategygame.engine.routing

import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.shared.values.UserId
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
sealed interface PlayerCommandDto {

    fun toDomain(user: UserId): PlayerCommand


    @Serializable
    @SerialName("FoundRealmCapital")
    class FoundRealmCapital(
        val q: Int,
        val r: Int
    ) : PlayerCommandDto {

        override fun toDomain(user: UserId) = PlayerCommand.FoundRealmCapital(
            playerId = user,
            location = HexPosition(
                q = this.q,
                r = this.r,
            )
        )
    }

}