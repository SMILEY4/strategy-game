package io.github.smiley4.strategygame.backend.sessions.disconnectplayer

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User

interface GameDbQueryByUser {
    suspend fun query(user: User.Id): List<Game>
}