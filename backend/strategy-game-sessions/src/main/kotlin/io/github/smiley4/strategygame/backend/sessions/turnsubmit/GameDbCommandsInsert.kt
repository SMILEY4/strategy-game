package io.github.smiley4.strategygame.backend.sessions.turnsubmit

import io.github.smiley4.strategygame.backend.commondata.Command

interface GameDbCommandsInsert {
    suspend fun insert(commands: Collection<Command<*>>)
}