package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import io.github.smiley4.strategygame.backend.engine.core.eco.ledger.ResourceLedger
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.ResourceLedgerEntryEntity.Companion.asServiceModel


data class ResourceLedgerEntity(
    val entries: List<ResourceLedgerEntryEntity>
) {

    companion object {

        fun of(serviceModel: ResourceLedger) = ResourceLedgerEntity(
            entries = serviceModel.getEntries().map { ResourceLedgerEntryEntity.of(it) }
        )

        fun ResourceLedgerEntity.asServiceModel(): ResourceLedger {
            val entries = this.entries.map { it.asServiceModel() }
            return ResourceLedger().also { it.setEntries(entries) }
        }

    }

}