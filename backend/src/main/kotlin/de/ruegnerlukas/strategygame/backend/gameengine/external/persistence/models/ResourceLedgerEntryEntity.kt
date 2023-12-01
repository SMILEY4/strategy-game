package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.detaillog.entity.DetailLogEntryEntity
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerEntry

data class ResourceLedgerEntryEntity(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<DetailLogEntryEntity<ResourceLedgerDetailType>>
) {

    companion object {

        fun of(serviceModel: ResourceLedgerEntry) = ResourceLedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            amount = serviceModel.amount,
            missing = serviceModel.missing,
            details = serviceModel.getDetails().map { DetailLogEntryEntity.of(it) }
        )

        fun ResourceLedgerEntryEntity.asServiceModel() = ResourceLedgerEntry(
            resourceType = this.resourceType,
            amount = this.amount,
            missing = this.missing,
            details = this.details.map { it.asServiceModel() }.toMutableList()
        )

    }

}