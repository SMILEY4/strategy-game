package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlementTier

data class UpgradeSettlementTierOperationData(
    val game: GameExtended,
    val city: City,
    val targetTier: SettlementTier
)