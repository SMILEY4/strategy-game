package io.github.smiley4.strategygame.backend.playerpov.lib

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.User

interface PlayerViewCreator {
    fun build(userId: User.Id, game: GameExtended): JsonType
}