package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlementTier


data class UpgradeSettlementTierOperationData(
    val game: GameExtended,
    val city: City,
    val targetTier: SettlementTier
)