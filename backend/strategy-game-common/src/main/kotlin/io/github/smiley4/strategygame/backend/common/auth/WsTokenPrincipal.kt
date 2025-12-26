package io.github.smiley4.strategygame.backend.common.auth

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User

data class WsTokenPrincipal(
    val gameId: Game.Id,
    val userId: User.Id,
)