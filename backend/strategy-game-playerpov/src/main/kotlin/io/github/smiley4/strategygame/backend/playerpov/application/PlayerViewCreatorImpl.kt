package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameValidations
import io.github.smiley4.strategygame.backend.engine.ports.provided.SettlementUtilities
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator


internal class PlayerViewCreatorImpl(private val gameValidations: GameValidations, private val settlementUtilities: SettlementUtilities) :
    PlayerViewCreator {

    override fun build(userId: User.Id, game: GameExtended): JsonType {
        return GameExtendedPOVBuilder(gameValidations, settlementUtilities).create(userId, game)
    }

}