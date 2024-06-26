package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.ResourceLedgerEntryEntity.Companion.asServiceModel


internal data class ResourceLedgerEntity(
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