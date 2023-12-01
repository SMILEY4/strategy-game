package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.ResourceLedgerEntryEntity.Companion.asServiceModel

data class ResourceLedgerEntity(
    val entries: List<ResourceLedgerEntryEntity>
) {

    companion object {

        fun of(serviceModel: ResourceLedger) = ResourceLedgerEntity(
            entries = serviceModel.getEntries().map { ResourceLedgerEntryEntity.of(it) }
        )

        fun ResourceLedgerEntity.asServiceModel(): ResourceLedger {
            val entries = this.entries.map { it.asServiceModel() }
            return ResourceLedger(ResourceLedgerDetailBuilderImpl()).also { it.setEntries(entries) }
        }

    }

}