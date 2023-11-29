package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.ledger.EconomyLedgerEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.GameEconomyLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.EconomyLedgerDetailEntity.Companion.asServiceModel

data class EconomyLedgerEntryEntity(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<EconomyLedgerDetailEntity>
) {

    companion object {

        fun of(serviceModel: EconomyLedgerEntry) = EconomyLedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            amount = serviceModel.amount,
            missing = serviceModel.missing,
            details = serviceModel.details.filterIsInstance<GameEconomyLedgerDetail>().map { EconomyLedgerDetailEntity.of(it) }
        )

        fun EconomyLedgerEntryEntity.asServiceModel() = EconomyLedgerEntry(
            resourceType = this.resourceType,
            amount = this.amount,
            missing = this.missing,
            details = this.details.map { it.asServiceModel() }.toMutableList()
        )

    }

}