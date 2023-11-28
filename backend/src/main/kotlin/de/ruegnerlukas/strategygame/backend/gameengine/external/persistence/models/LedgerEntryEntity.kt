package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.ledger.LedgerResourceEntry
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.LedgerDetailEntity.Companion.asServiceModel

data class LedgerEntryEntity(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<LedgerDetailEntity>
) {

    companion object {

        fun of(serviceModel: LedgerResourceEntry) = LedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            amount = serviceModel.amount,
            missing = serviceModel.missing,
            details = serviceModel.details.map { LedgerDetailEntity.of(it) }
        )

        fun LedgerEntryEntity.asServiceModel() = LedgerResourceEntry(
            resourceType = this.resourceType,
            amount = this.amount,
            missing = this.missing,
            details = this.details.map { it.asServiceModel() }.toMutableList()
        )

    }

}