package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.ledger.ResourceLedgerEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.GameResourceLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.EconomyLedgerDetailEntity.Companion.asServiceModel

data class ResourceLedgerEntryEntity(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<EconomyLedgerDetailEntity>
) {

    companion object {

        fun of(serviceModel: ResourceLedgerEntry) = ResourceLedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            amount = serviceModel.amount,
            missing = serviceModel.missing,
            details = serviceModel.details.filterIsInstance<GameResourceLedgerDetail>().map { EconomyLedgerDetailEntity.of(it) }
        )

        fun ResourceLedgerEntryEntity.asServiceModel() = ResourceLedgerEntry(
            resourceType = this.resourceType,
            amount = this.amount,
            missing = this.missing,
            details = this.details.map { it.asServiceModel() }.toMutableList()
        )

    }

}