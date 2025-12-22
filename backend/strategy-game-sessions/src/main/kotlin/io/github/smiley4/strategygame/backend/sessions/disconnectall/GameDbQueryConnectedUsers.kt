package io.github.smiley4.strategygame.backend.sessions.disconnectall

import io.github.smiley4.strategygame.backend.commondata.User

interface GameDbQueryConnectedUsers {
    suspend fun query(): List<User.Id>
}