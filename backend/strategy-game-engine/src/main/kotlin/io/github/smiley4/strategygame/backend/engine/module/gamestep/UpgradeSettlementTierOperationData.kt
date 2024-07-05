package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.SettlementTier


data class UpgradeSettlementTierOperationData(
    val game: GameExtended,
    val city: City,
    val targetTier: SettlementTier
)