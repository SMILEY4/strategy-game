package io.github.smiley4.strategygame.backend.worlds.module.client

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.Command

internal interface GameStep {
    suspend fun perform(gameId: String, commands: Collection<Command<*>>, userIds: Collection<String>): Map<String, JsonType>
}